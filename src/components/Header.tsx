import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product, ProductResponse } from "../types";
import { API_URL, currency, fetchJson, getErrorMessage } from "../utils";
import SignupDialog from "./SignupDialog";

export type HeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  deliveryLocation: string;
  onOpenLocation: () => void;
};

export default function Header({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  cartCount,
  onOpenCart,
  deliveryLocation,
  onOpenLocation,
}: HeaderProps) {
  const [signupOpen, setSignupOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");

  useEffect(() => {
    const searchTerm = query.trim();
    if (!searchTerm) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionError("");
      return;
    }

    const controller = new AbortController();
    setSuggestions([]);
    setSuggestionsLoading(true);
    setSuggestionError("");
    const timeoutId = window.setTimeout(() => {
      void fetchJson<ProductResponse>(
        `${API_URL}/products/search?q=${encodeURIComponent(searchTerm)}`,
        controller.signal,
      )
        .then((response) => setSuggestions(response.products.slice(0, 6)))
        .catch((searchError: unknown) => {
          if (!controller.signal.aborted) {
            setSuggestionError(getErrorMessage(searchError));
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSuggestionsLoading(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <header className="site-header">
        <div className="topbar">
          <Link aria-label="Home" className="brand-mark" to="/">
            <img alt="" className="brand-logo" src="/logo.svg" />
          </Link>
          <button
            aria-label={`Update delivery location, currently ${deliveryLocation || "Select address"}`}
            className="delivery-location"
            onClick={onOpenLocation}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
            <span>
              <span>Deliver to</span>
              <strong>{deliveryLocation || "Select address"}</strong>
            </span>
          </button>
          <div
            className="header-search"
            onBlur={(event) => {
              const nextFocusedElement = event.relatedTarget;
              if (
                !(nextFocusedElement instanceof Node) ||
                !event.currentTarget.contains(nextFocusedElement)
              ) {
                setSuggestionsOpen(false);
              }
            }}
          >
            <label className="searchbox">
              <select
                aria-label="Search category"
                className="search-category"
                onChange={(event) => onCategoryChange(event.target.value)}
                value={category}
              >
                <option value="">All</option>
                <option value="smartphones">Mobiles</option>
                <option value="laptops">Laptops</option>
                <option value="fragrances">Fragrances</option>
                <option value="beauty">Beauty</option>
                <option value="home-decoration">Home &amp; Kitchen</option>
              </select>
              <input
                aria-label="Search products"
                aria-autocomplete="list"
                aria-controls="product-search-suggestions"
                aria-expanded={suggestionsOpen && Boolean(query.trim())}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  setSuggestionsOpen(Boolean(nextQuery.trim()));
                  onQueryChange(nextQuery);
                }}
                onFocus={() => {
                  if (query.trim()) setSuggestionsOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSuggestionsOpen(false);
                }}
                placeholder="Search Amazon products, brands and more..."
                role="combobox"
                type="search"
                value={query}
              />
              <span className="search-submit" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="m15.5 15.5 5 5" />
                </svg>
              </span>
            </label>
            {suggestionsOpen && query.trim() && (
              <div
                aria-label="Product suggestions"
                className="search-suggestions"
                id="product-search-suggestions"
                role="listbox"
              >
                {suggestionsLoading ? (
                  <p role="status">Searching products...</p>
                ) : suggestionError ? (
                  <p role="alert">
                    Suggestions unavailable: {suggestionError}
                  </p>
                ) : suggestions.length ? (
                  suggestions.map((product) => (
                    <Link
                      aria-label={`View ${product.title}`}
                      className="search-suggestion"
                      key={product.id}
                      onClick={() => setSuggestionsOpen(false)}
                      role="option"
                      to={`/product/${product.id}`}
                    >
                      <img alt="" src={product.thumbnail} />
                      <span className="search-suggestion-info">
                        <strong>{product.title}</strong>
                        <small>{product.brand || product.category}</small>
                      </span>
                      <strong className="search-suggestion-price">
                        {currency(product.price)}
                      </strong>
                    </Link>
                  ))
                ) : (
                  <p role="status">No matching products found.</p>
                )}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button
              aria-label="Your account"
              className="account-button"
              onClick={() => setSignupOpen(true)}
              type="button"
            >
              <span>Hello, sign in</span>
              <strong>Account &amp; Lists</strong>
            </button>
            <button
              aria-label="Returns and orders"
              className="returns-button"
              onClick={() => setSignupOpen(true)}
              type="button"
            >
              <span>Returns</span>
              <strong>&amp; Orders</strong>
            </button>
            <button
              aria-label={`Your cart (${cartCount} ${cartCount === 1 ? "item" : "items"})`}
              className="icon-button"
              onClick={onOpenCart}
              type="button"
            >
              <span aria-hidden="true" className="cart-icon">
                <svg viewBox="0 0 32 28">
                  <path d="M2 3h4l3.2 15.1a2.4 2.4 0 0 0 2.4 1.9h12.7a2.4 2.4 0 0 0 2.3-1.8L29 8H8" />
                  <circle cx="12" cy="25" r="1.5" />
                  <circle cx="24" cy="25" r="1.5" />
                </svg>
              </span>
              <span className="cart-count">{cartCount}</span>
              <strong>Cart</strong>
            </button>
          </div>
        </div>
        <nav aria-label="Shop departments" className="secondary-nav">
          <Link className="all-filters" to="/#filters">
            <span aria-hidden="true">☰</span> All Filters
          </Link>
          <Link className="all-deals" to="/?sort=price-asc">All Deals</Link>
          <Link to="/?category=smartphones">Smartphones</Link>
          <Link to="/?category=laptops">Laptops</Link>
          <Link to="/?category=fragrances">Fragrances</Link>
          <Link to="/?category=beauty">Beauty</Link>
          <Link to="/?category=furniture">Furniture</Link>
          <Link to="/?category=groceries">Groceries</Link>
          <Link to="/?category=home-decoration">Home Decor</Link>
          <Link to="/?category=womens-dresses">Fashion</Link>
          <Link to="/?category=kitchen-accessories">Kitchen</Link>
        </nav>
      </header>
      {signupOpen && <SignupDialog onClose={() => setSignupOpen(false)} />}
    </>
  );
}
