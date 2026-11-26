import { useCallback, useEffect, useState } from "react";

const cache = new Map<string, unknown>();

export function getCachedValue<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function clearFetchCache(): void {
  cache.clear();
}

type FetchState<T> = {
  key: string;
  data: T | undefined;
  error: unknown;
  loading: boolean;
};

export function useFetch<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
) {
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<FetchState<T>>(() => {
    const cached = cache.get(key) as T | undefined;
    return {
      key,
      data: cached,
      error: null,
      loading: cached === undefined,
    };
  });

  const hasCachedForKey = cache.has(key);
  const data =
    state.key === key
      ? state.data
      : hasCachedForKey
        ? (cache.get(key) as T)
        : undefined;
  const error = state.key === key ? state.error : null;
  const loading = state.key === key ? state.loading : !hasCachedForKey;

  useEffect(() => {
    if (cache.has(key)) {
      return;
    }

    const controller = new AbortController();

    fetcher(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        cache.set(key, result);
        setState({ key, data: result, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ key, data: undefined, error: err, loading: false });
      });

    return () => controller.abort();
  }, [key, fetcher, retryCount]);

  const retry = useCallback(() => {
    cache.delete(key);
    setState({ key, data: undefined, error: null, loading: true });
    setRetryCount((count) => count + 1);
  }, [key]);

  return { data, loading, error, retry };
}
