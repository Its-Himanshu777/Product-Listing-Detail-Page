import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import HeaderActions from "./HeaderActions";

type HeaderProps = {
  onToggleFilters: () => void;
};

export default function Header({ onToggleFilters }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isListingPage = location.pathname === "/";
  const urlQuery = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);

  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setInputValue(urlQuery);
  }

  const debouncedQuery = useDebouncedValue(inputValue, 300);

  useEffect(() => {
    if (!isListingPage) return;
    if (debouncedQuery !== inputValue) return;

    const trimmed = debouncedQuery.trim();
    if (trimmed === urlQuery) return;

    const next = new URLSearchParams(searchParams);
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");
    setSearchParams(next, { replace: true });
  }, [
    debouncedQuery,
    inputValue,
    isListingPage,
    searchParams,
    setSearchParams,
    urlQuery,
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = inputValue.trim();
    const next = new URLSearchParams(isListingPage ? searchParams : undefined);
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");

    if (isListingPage) {
      setSearchParams(next, { replace: true });
    } else {
      const search = next.toString();
      navigate({ pathname: "/", search: search ? `?${search}` : "" });
    }
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-header text-white shadow-[0_2px_12px_rgba(24,48,74,0.14)]">
      <div className="mx-auto grid h-full max-w-[1320px] grid-cols-[auto_minmax(0,1fr)_auto] items-center justify-between gap-3 px-3 sm:grid-cols-[auto_minmax(0,480px)_auto] sm:gap-4 sm:px-5">
        <button
          aria-label="Toggle filters"
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[6px] border-0 bg-transparent text-white transition-colors hover:bg-white/12 focus-visible:outline-white"
          onClick={onToggleFilters}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="22"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
            width="22"
          >
            <line x1="4" x2="20" y1="7" y2="7" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="17" y2="17" />
          </svg>
        </button>

        <form
          className="flex h-[38px] w-full items-center gap-2 rounded-[6px] bg-white px-3 text-ink shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-blue-300"
          onSubmit={handleSubmit}
          role="search"
        >
          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center text-muted"
          >
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="20" x2="16.65" y1="20" y2="16.65" />
            </svg>
          </span>
          <input
            aria-label="Search products"
            className="w-full min-w-0 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search products..."
            type="search"
            value={inputValue}
          />
        </form>

        <HeaderActions />
      </div>
    </header>
  );
}
