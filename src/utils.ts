export const API_URL = "https://dummyjson.com";
export const PAGE_SIZE = 12;

export async function fetchJson<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}). Please try again.`);
  }
  return response.json() as Promise<T>;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function currency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
