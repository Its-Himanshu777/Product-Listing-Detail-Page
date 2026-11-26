# Product Listing & Detail Page

A scoped React + TypeScript storefront built with Vite and powered by the [DummyJSON Products API](https://dummyjson.com/docs/products).

- **Live demo:** [Deploy on Vercel and add your live URL here](#)

## Setup

### Prerequisites

- Node.js `>=20.19`
- npm

### Run locally

```bash
git clone https://github.com/Its-Himanshu777/Product-Listing-Detail-Page.git
cd Product-Listing-Detail-Page
npm ci
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

### Available scripts

- `npm run dev` — start the Vite development server
- `npm test` — run unit and integration tests with Vitest
- `npm run lint` — run ESLint across the codebase
- `npm run format` — format files with Prettier
- `npm run build` — run TypeScript typechecking (`tsc -b`) and build production assets into `dist/`

## Requirements coverage

| Requirement                                           | Implementation                                                                                                                                                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product listing (image, title, price, rating)         | [ProductCard.tsx](src/components/product/ProductCard.tsx), [ProductGrid.tsx](src/components/product/ProductGrid.tsx)                                                                           |
| Dynamic categories from `/products/categories`        | [useCategories.ts](src/hooks/useCategories.ts), [CategoryFilter.tsx](src/components/filters/CategoryFilter.tsx)                                                                                |
| Category endpoint & scoped brand extraction           | [useProducts.ts](src/hooks/useProducts.ts), [filterProducts.ts](src/lib/filterProducts.ts), [BrandFilter.tsx](src/components/filters/BrandFilter.tsx)                                          |
| Debounced & validated price range filter              | [PriceRangeFilter.tsx](src/components/filters/PriceRangeFilter.tsx), [useDebouncedValue.ts](src/hooks/useDebouncedValue.ts)                                                                    |
| Pure filtering & pagination logic                     | [filterProducts.ts](src/lib/filterProducts.ts), [Pagination.tsx](src/components/ui/Pagination.tsx)                                                                                             |
| Product detail page (7 required fields + Back button) | [ProductDetailPage.tsx](src/pages/ProductDetailPage.tsx), [useProduct.ts](src/hooks/useProduct.ts)                                                                                             |
| Filter preservation across detail navigation & Back   | [useFilterParams.ts](src/hooks/useFilterParams.ts), [ProductCard.tsx](src/components/product/ProductCard.tsx), [ProductDetailPage.tsx](src/pages/ProductDetailPage.tsx)                        |
| Error handling, loading states, 404 & error boundary  | [useFetch.ts](src/hooks/useFetch.ts), [ErrorState.tsx](src/components/ui/ErrorState.tsx), [ErrorBoundary.tsx](src/components/layout/ErrorBoundary.tsx), [NotFound.tsx](src/pages/NotFound.tsx) |

## Assumptions

- Brands are derived from the currently fetched product set (all products or the active category) rather than globally, so users are never offered dead brand options.
- Price range filtering, brand filtering, and pagination run in the browser on the fetched product set.
- Filter and page state (`category`, `min`, `max`, `brand`, `q`, `page`) lives in the URL query string.
- Prices returned by DummyJSON are raw USD values and are formatted in USD (`Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`).

## Architecture decisions

- **Folder structure:** Separation of concerns across `src/api/` (typed HTTP client and endpoints), `src/hooks/` (data fetching cache, debouncing, URL filter state), `src/lib/` (pure filter/pagination/format helpers), `src/components/` (reusable layout, filter, product, and UI primitives), and `src/pages/` (`ListingPage`, `ProductDetailPage`, `NotFound`).
- **URL-backed filters:** Keeping filters in `URLSearchParams` makes filtered views bookmarkable, prevents drift between components, and preserves state seamlessly when navigating to `/product/:id` and back.
- **Fetch strategy (category-scoped):** When no category is selected, the app fetches `/products?limit=0` with `select=` to keep payloads small; when a category is selected, it fetches `/products/category/{slug}?limit=0`. This uses the brief's category endpoint directly without duplicate fetches.
- **In-memory cache (`useFetch`):** Responses are cached in a module-level `Map` with `AbortController` cleanup and a `retry()` callback, eliminating redundant network calls and loading skeletons when pressing Back from a detail page.
- **TypeScript & Tailwind CSS:** Strict TypeScript catches API and prop mismatches early, while Tailwind CSS v4 with custom `@theme` tokens in [global.css](src/styles/global.css) keeps styling concise and consistent across components.

## Trade-offs and improvements with more time

- **Extras branch vs. `main`:** Full cart checkout/add-to-cart, geolocation delivery address, sort dropdown, 360° viewer, and customer reviews remain archived on the `extras` branch, while `main` stays focused on the brief alongside the wireframe header search (`?q=`) and lightweight Cart / Recently Viewed / Account header popovers.
- **Filtering & Facets:**
  - Add a price **range slider** next to the min/max inputs using bounds derived from the loaded dataset.
  - Add **brand search** inside the brand list and a **"Show more"** toggle after 8 brands.
  - Compute **facet counts** dynamically as other active filters change.
  - Add **sort** by price or rating (deliberately omitted from `main` to stay within the 2-day brief).
- **Search & Browsing:**
  - Upgrade client-side `?q=` filtering to debounced typeahead suggestions backed by `/products/search`.
  - Offer "Load more" or infinite scroll with a virtualised grid as an alternative to pagination.
- **Product Detail & UX:**
  - Add image zoom on hover, a lightbox gallery, and a related-products row from the same category.
  - Support dark mode via Tailwind `@theme` tokens in [global.css](src/styles/global.css).
  - Persist **recently viewed products** in `localStorage` (currently held in memory for the active session).
- **Architecture, Backend & Quality:**
  - Move filtering, sorting, and pagination to a real backend and adopt **TanStack Query** for caching, deduplication, background revalidation, and retries.
  - Enforce Lighthouse score ≥ 95, bundle-size budgets, and **Playwright** end-to-end tests in CI.
