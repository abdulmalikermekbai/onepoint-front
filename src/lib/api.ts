/**
 * API Client для взаимодействия фронтенда с PHP backend (https://api.onepoint.kz/api/)
 */

export const BACKEND_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.onepoint.kz/api";

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BACKEND_API_BASE}/${endpoint.replace(/^\//, "")}`;

  const isGet = !options?.method || options.method.toUpperCase() === "GET";
  const defaultCacheOptions: RequestInit =
    typeof window === "undefined" && isGet
      ? { next: { revalidate: 60 } }
      : isGet
      ? {}
      : { cache: "no-store" };

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers || {}),
    },
    ...defaultCacheOptions,
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText} (${url})`);
  }

  return res.json() as Promise<T>;
}
