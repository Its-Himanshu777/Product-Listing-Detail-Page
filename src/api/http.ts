export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `Request failed (${status}).`);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function http<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new HttpError(
      response.status,
      `Request failed (${response.status}).`,
    );
  }
  return response.json() as Promise<T>;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 404) {
      return "The requested resource could not be found.";
    }
    return `Server error (${error.status}). Please try again.`;
  }
  if (error instanceof TypeError) {
    return "Network error. Please check your internet connection and try again.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
