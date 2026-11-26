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

type NominatimResponse = {
  display_name?: string;
  address?: {
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

type BigDataCloudResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  postcode?: string;
  countryName?: string;
};

function joinUniqueParts(parts: Array<string | undefined>): string {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const part of parts) {
    const trimmed = part?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(trimmed);
  }
  return unique.join(", ");
}

function formatNominatimAddress(data: NominatimResponse): string {
  const addr = data.address;
  if (addr) {
    const area =
      addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district;
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state_district ||
      addr.state;
    const primary = joinUniqueParts([area, city]);
    const withPostcode = addr.postcode
      ? primary
        ? `${primary} ${addr.postcode}`
        : addr.postcode
      : primary;
    if (withPostcode) return withPostcode;
  }

  if (data.display_name) {
    return data.display_name
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(", ");
  }

  return "";
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<string> {
  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    String(latitude),
  )}&lon=${encodeURIComponent(String(longitude))}&addressdetails=1`;

  try {
    const nominatimData = await fetchJson<NominatimResponse>(
      nominatimUrl,
      signal,
    );
    const formatted = formatNominatimAddress(nominatimData);
    if (formatted) return formatted;
  } catch (error) {
    if (signal?.aborted) throw error;
  }

  const fallbackUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
    String(latitude),
  )}&longitude=${encodeURIComponent(String(longitude))}&localityLanguage=en`;

  const fallbackData = await fetchJson<BigDataCloudResponse>(
    fallbackUrl,
    signal,
  );
  const locality = joinUniqueParts([
    fallbackData.locality,
    fallbackData.city || fallbackData.principalSubdivision,
  ]);
  const formatted = fallbackData.postcode
    ? locality
      ? `${locality} ${fallbackData.postcode}`
      : fallbackData.postcode
    : locality || fallbackData.countryName?.trim() || "";

  if (!formatted) {
    throw new Error("Unable to resolve an address from your coordinates.");
  }

  return formatted;
}
