/**
 * API Client для onepoint.kz
 * 
 * Все запросы к PHP бэкенду (https://api.onepoint.kz/api/) проходят через этот клиент.
 * Next.js serverless routes (/api/lead, /api/newsletter) работают отдельно.
 */

// Базовый URL PHP API
// На продакшне (Vercel) — через Next.js rewrite /backend-api/* -> https://api.onepoint.kz/api/*
// На локале — через прокси или прямой URL
export const BACKEND_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.onepoint.kz/api";

/**
 * Универсальная функция для запросов к PHP бэкенду
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BACKEND_API_BASE}/${endpoint.replace(/^\//, "")}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText} (${url})`);
  }

  return res.json() as Promise<T>;
}

// ─── Shortcuts ────────────────────────────────────────────────────────────────

/** Получить список продуктов */
export const fetchProducts = (params?: string) =>
  apiRequest<unknown[]>(`products${params ? `?${params}` : ""}`);

/** Получить продукт по slug или id */
export const fetchProduct = (slugOrId: string | number) =>
  apiRequest<unknown>(`products/${slugOrId}`);

/** Получить категории */
export const fetchCategories = () =>
  apiRequest<unknown[]>("categories");

/** Получить хиты продаж */
export const fetchBestsellers = () =>
  apiRequest<unknown[]>("products?is_hit=1");

/** Получить новинки */
export const fetchNewArrivals = () =>
  apiRequest<unknown[]>("products?is_new=1");

/** Получить акции */
export const fetchPromotions = () =>
  apiRequest<unknown[]>("products?is_sale=1");

/** Поиск продуктов */
export const searchProducts = (query: string) =>
  apiRequest<unknown[]>(`products?search=${encodeURIComponent(query)}`);
