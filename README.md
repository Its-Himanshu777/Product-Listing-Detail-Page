# Product Listing & Detail Page

A React and TypeScript product storefront built with Vite. It includes product browsing, search suggestions, filters, product details, a cart, and delivery-location controls.

## Setup instructions

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm

### Run locally

```bash
git clone https://github.com/<your-username>/product-listing-detail-page.git
cd product-listing-detail-page
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Build and preview

```bash
npm run build
npm run preview
```

The build command runs the TypeScript project build before creating production assets in `dist/`. When deploying, configure the hosting provider to serve the SPA entry point for client-side routes such as `/product/:id`.

## Assumptions made

- Product data and search results come from the public DummyJSON API. The storefront depends on that service being reachable.
- API prices are displayed as Indian rupees (INR).
- The product API does not provide complete color variants or 3D models. The product viewer rotates through available product images; it is not a true 3D model.
- The account prompt currently validates an email address or an Indian mobile number only. It does not create an account or sign a user in because no authentication backend is configured.
- The cart and delivery location are held in React state and reset when the page is refreshed.
- Orders, payment, inventory, and returns are not connected to backend services.

## Architectural decisions

- React with TypeScript is used for the UI, with Vite for development and production builds.
- React Router handles the product-list route (`/`) and product-detail routes (`/product/:id`).
- `App` owns shared cart and delivery-location state; page-specific product and filter state stays in the corresponding pages.
- Listing filters and search queries are represented in URL search parameters so the current listing state is navigable.
- The header debounces requests to DummyJSON's product-search endpoint and displays matching product suggestions.
- Shared API, error-message, pagination, and currency helpers live in `src/utils.ts`; shared product and cart shapes live in `src/types.ts`.
- Styles are maintained in `src/styles.css` and include responsive layouts.

## Improvements if given more time

- Add a secure authentication backend for registration, sign-in, session management, and order history.
- Persist cart and delivery-location state, and connect checkout, payments, inventory, orders, and returns to real services.
- Make the product API base URL configurable per environment and provide a resilient offline/error experience.
- Add automated unit, integration, and end-to-end tests for search, filters, cart, location, and authentication flows.
- Improve keyboard navigation and screen-reader support for search suggestions and dialogs.
- Replace image rotation with real product 3D assets if those become available.
