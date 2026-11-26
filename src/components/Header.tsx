import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { LocationStatus, Product, ProductResponse } from "../types";
import { API_URL, currency, fetchJson, getErrorMessage } from "../utils";
import SignupDialog from "./SignupDialog";

const SEARCH_CATEGORIES = [
  { value: "", label: "All" },
  { value: "smartphones", label: "Mobiles" },
  { value: "laptops", label: "Laptops" },
  { value: "fragrances", label: "Fragrances" },
  { value: "beauty", label: "Beauty" },
  { value: "home-decoration", label: "Home & Kitchen" },
] as const;

export type HeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  deliveryLocation: string;
  locationStatus?: LocationStatus;
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
  locationStatus = "idle",
  onOpenLocation,
}: HeaderProps) {
  const [signupOpen, setSignupOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const categoryTriggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedCategory =
    SEARCH_CATEGORIES.find((option) => option.value === category) ??
    SEARCH_CATEGORIES[0];
  const isDetectingLocation =
    locationStatus === "loading" && !deliveryLocation;
  const locationDisplay =
    deliveryLocation ||
    (isDetectingLocation
      ? "current location..."
      : locationStatus === "error"
        ? "Enter location"
        : "Select address");

  useEffect(() => {
    if (!categoryOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [categoryOpen]);

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

  function selectCategory(nextCategory: string) {
    onCategoryChange(nextCategory);
    setCategoryOpen(false);
    categoryTriggerRef.current?.focus();
  }

  function stepCategory(direction: 1 | -1) {
    const currentIndex = SEARCH_CATEGORIES.findIndex(
      (option) => option.value === category,
    );
    const baseIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex =
      (baseIndex + direction + SEARCH_CATEGORIES.length) %
      SEARCH_CATEGORIES.length;
    onCategoryChange(SEARCH_CATEGORIES[nextIndex].value);
  }

  return (
    <>
      <header className="site-header">
        <div className="topbar">
          <Link aria-label="Home" className="brand-mark" to="/">
            <img alt="" className="brand-logo" src="/logo.svg" />
          </Link>
          <button
            aria-busy={isDetectingLocation}
            aria-label={`Update delivery location, currently ${locationDisplay}`}
            className={`delivery-location${isDetectingLocation ? " is-loading" : ""}`}
            onClick={onOpenLocation}
            type="button"
          >
            {isDetectingLocation ? (
              <span aria-hidden="true" className="location-spinner" />
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z" />
                <circle cx="12" cy="10" r="2.2" />
              </svg>
            )}
            <span>
              <span>{isDetectingLocation ? "Locating" : "Deliver to"}</span>
              <strong>{locationDisplay}</strong>
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
                setCategoryOpen(false);
              }
            }}
            ref={categoryMenuRef}
          >
            <div className="searchbox" role="search">
              <button
                aria-controls="search-category-listbox"
                aria-expanded={categoryOpen}
                aria-haspopup="listbox"
                aria-label={`Search category: ${selectedCategory.label}`}
                className={`search-category-trigger${categoryOpen ? " is-open" : ""}`}
                onClick={() => {
                  setSuggestionsOpen(false);
                  setCategoryOpen((open) => !open);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    if (!categoryOpen) setCategoryOpen(true);
                    else stepCategory(1);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    if (!categoryOpen) setCategoryOpen(true);
                    else stepCategory(-1);
                  } else if (event.key === "Escape" && categoryOpen) {
                    event.preventDefault();
                    setCategoryOpen(false);
                  }
                }}
                ref={categoryTriggerRef}
                type="button"
              >
                <span className="search-category-label">
                  {selectedCategory.label}
                </span>
                <svg
                  aria-hidden="true"
                  className="search-category-chevron"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
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
                  setCategoryOpen(false);
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
            </div>
            {categoryOpen && (
              <div
                aria-label="Search categories"
                className="search-category-menu"
                id="search-category-listbox"
                role="listbox"
              >
                {SEARCH_CATEGORIES.map((option) => {
                  const isSelected = option.value === selectedCategory.value;
                  return (
                    <button
                      aria-selected={isSelected}
                      className={`search-category-option${isSelected ? " is-selected" : ""}`}
                      key={option.value || "all"}
                      onClick={() => selectCategory(option.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setCategoryOpen(false);
                          categoryTriggerRef.current?.focus();
                        }
                      }}
                      role="option"
                      type="button"
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <span aria-hidden="true" className="search-category-check">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
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
