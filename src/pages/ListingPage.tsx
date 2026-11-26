import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import type { Category, Product, ProductResponse } from "../types";
import { API_URL, fetchJson, getErrorMessage, PAGE_SIZE } from "../utils";

type ListingPageProps = {
  cartCount: number;
  onOpenCart: () => void;
  deliveryLocation: string;
  onOpenLocation: () => void;
  onAddToCart: (product: Product) => void;
};

function useListingFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";
  const query = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "recommended";
  const brands = searchParams.getAll("brand");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next, { replace: true });
  }

  function toggleBrand(brand: string) {
    const next = new URLSearchParams(searchParams);
    const selected = next.getAll("brand");
    next.delete("brand");
    for (const value of selected) {
      if (value !== brand) next.append("brand", value);
    }
    if (!selected.includes(brand)) next.append("brand", brand);
    next.delete("page");
    setSearchParams(next, { replace: true });
  }

  function setPage(value: number) {
    const next = new URLSearchParams(searchParams);
    if (value > 1) next.set("page", String(value));
    else next.delete("page");
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    setSearchParams(next, { replace: true });
  }

  return {
    category,
    minPrice,
    maxPrice,
    query,
    sort,
    brands,
    page,
    updateParam,
    toggleBrand,
    setPage,
    clearFilters,
  };
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  for (let index = 0; index < sorted.length; index++) {
    const page = sorted[index];
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  }
  return items;
}

export default function ListingPage({
  cartCount,
  onOpenCart,
  deliveryLocation,
  onOpenLocation,
  onAddToCart,
}: ListingPageProps) {
  const filters = useListingFilters();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadInitialData() {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetchJson<ProductResponse>(
            `${API_URL}/products?limit=0`,
            controller.signal,
          ),
          fetchJson<Array<string | { slug: string; name: string }>>(
            `${API_URL}/products/categories`,
            controller.signal,
          ),
        ]);
        const normalizedCategories = categoryResponse.map((category) =>
          typeof category === "string"
            ? { slug: category, name: category.replace(/-/g, " ") }
            : category,
        );
        setAllProducts(productResponse.products);
        setCategories(normalizedCategories);
        if (!filters.category) setProducts(productResponse.products);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError));
      } finally {
        if (!controller.signal.aborted && !filters.category) setLoading(false);
      }
    }
    void loadInitialData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!filters.category) {
      if (allProducts.length > 0) {
        setProducts(allProducts);
        setLoading(false);
        setError("");
      }
      return;
    }

    const controller = new AbortController();
    async function loadCategory() {
      setLoading(true);
      setError("");
      try {
        const response = await fetchJson<ProductResponse>(
          `${API_URL}/products/category/${encodeURIComponent(filters.category)}`,
          controller.signal,
        );
        setProducts(response.products);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadCategory();
    return () => controller.abort();
  }, [filters.category, allProducts]);

  const brands = useMemo(
    () =>
      [
        ...new Set(
          allProducts
            .map((product) => product.brand)
            .filter(Boolean) as string[],
        ),
      ].sort(),
    [allProducts],
  );

  const filteredProducts = useMemo(() => {
    const min =
      filters.minPrice === ""
        ? Number.NEGATIVE_INFINITY
        : Number(filters.minPrice);
    const max =
      filters.maxPrice === ""
        ? Number.POSITIVE_INFINITY
        : Number(filters.maxPrice);
    const normalizedQuery = filters.query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesPrice = product.price >= min && product.price <= max;
      const matchesBrand =
        filters.brands.length === 0 ||
        filters.brands.includes(product.brand ?? "");
      const matchesQuery =
        !normalizedQuery ||
        `${product.title} ${product.description} ${product.brand ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesPrice && matchesBrand && matchesQuery;
    });
  }, [
    products,
    filters.minPrice,
    filters.maxPrice,
    filters.brands,
    filters.query,
  ]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (filters.sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return sorted;
  }, [filteredProducts, filters.sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / PAGE_SIZE),
  );
  const currentPage = Math.min(filters.page, totalPages);
  const visibleProducts = sortedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const location = useLocation();
  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    filters.brands.length;
  const paginationItems = getPaginationItems(currentPage, totalPages);

  useEffect(() => {
    if (location.hash === "#filters") {
      setMobileFiltersOpen(true);
      document
        .getElementById("filters")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  function updateSearch(value: string) {
    filters.updateParam("q", value);
  }

  return (
    <>
      <Header
        category={filters.category}
        onCategoryChange={(value) => filters.updateParam("category", value)}
        query={filters.query}
        onQueryChange={updateSearch}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        deliveryLocation={deliveryLocation}
        onOpenLocation={onOpenLocation}
      />
      <main className="page-shell">
        <section className="page-heading">
          <div>
            <p className="eyebrow">SHOP ALL PRODUCTS</p>
            <h1>Everything you need, all in one place.</h1>
            <p className="page-subtitle">
              Browse popular products from brands you love.
            </p>
          </div>
          <div className="heading-note">
            <span className="sparkle">✓</span>
            <span>Great prices. Everyday essentials.</span>
          </div>
        </section>

        <div className="catalog-layout">
          <aside
            className={`filters-panel${mobileFiltersOpen ? " is-open" : ""}`}
            id="filters"
          >
            <div className="filter-heading">
              <div>
                <span className="eyebrow">NARROW YOUR SEARCH</span>
                <h2>Filters</h2>
              </div>
              <div className="filter-heading-actions">
                <button
                  className="text-button"
                  onClick={filters.clearFilters}
                  type="button"
                >
                  Clear all
                </button>
                <button
                  className="mobile-filter-close"
                  onClick={() => setMobileFiltersOpen(false)}
                  type="button"
                >
                  Done
                </button>
              </div>
            </div>

            <label className="filter-label" htmlFor="category-filter">
              Category
            </label>
            <div className="select-wrap">
              <select
                id="category-filter"
                onChange={(event) =>
                  filters.updateParam("category", event.target.value)
                }
                value={filters.category}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <span aria-hidden="true">⌄</span>
            </div>

            <div className="filter-divider" />
            <p className="filter-label">Price range</p>
            <div className="price-inputs">
              <label>
                <span>₹</span>
                <input
                  aria-label="Minimum price"
                  min="0"
                  onChange={(event) =>
                    filters.updateParam("min", event.target.value)
                  }
                  placeholder="Min"
                  type="number"
                  value={filters.minPrice}
                />
              </label>
              <span className="price-separator">to</span>
              <label>
                <span>₹</span>
                <input
                  aria-label="Maximum price"
                  min="0"
                  onChange={(event) =>
                    filters.updateParam("max", event.target.value)
                  }
                  placeholder="Max"
                  type="number"
                  value={filters.maxPrice}
                />
              </label>
            </div>
            <p className="filter-hint">Prices shown in Indian rupees</p>

            <div className="filter-divider" />
            <div className="filter-subheading">
              <p className="filter-label">Brand</p>
              <span>{brands.length}</span>
            </div>
            <div className="brand-list">
              {brands.map((brand) => (
                <label className="check-option" key={brand}>
                  <input
                    checked={filters.brands.includes(brand)}
                    onChange={() => filters.toggleBrand(brand)}
                    type="checkbox"
                  />
                  <span>{brand}</span>
                  <span className="checkmark" aria-hidden="true">
                    ✓
                  </span>
                </label>
              ))}
            </div>
            <div className="filter-footer">
              <span className="filter-footer-icon">✓</span>
              <p>Free delivery on eligible orders.</p>
            </div>
          </aside>

          <section aria-label="Product results" className="results-section">
            <div className="results-toolbar">
              <div>
                <h2>Featured products</h2>
                <p>
                  {loading
                    ? "Finding the good stuff..."
                    : `${filteredProducts.length} ${
                        filteredProducts.length === 1 ? "result" : "results"
                      }`}
                </p>
              </div>
              <div className="toolbar-controls">
                <button
                  aria-controls="filters"
                  aria-expanded={mobileFiltersOpen}
                  className={`mobile-filter-toggle${mobileFiltersOpen || activeFilterCount > 0 ? " is-active" : ""}`}
                  onClick={() => setMobileFiltersOpen((open) => !open)}
                  type="button"
                >
                  <span aria-hidden="true">☰</span>
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="mobile-filter-count">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <div className="sort-control">
                  <span>Sorted by</span>
                  <select
                    aria-label="Sort products"
                    onChange={(event) =>
                      filters.updateParam("sort", event.target.value)
                    }
                    value={filters.sort}
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Customer Rating</option>
                    <option value="title-asc">Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>

            {error ? (
              <div className="state-card error-state" role="alert">
                <span className="state-icon">!</span>
                <h3>We couldn&apos;t load the products.</h3>
                <p>{error}</p>
                <button
                  className="button button-dark"
                  onClick={() => window.location.reload()}
                  type="button"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div
                aria-label="Loading products"
                aria-live="polite"
                className="product-grid"
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <div className="product-card skeleton" key={index}>
                    <div className="skeleton-image" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                ))}
              </div>
            ) : visibleProducts.length ? (
              <div className="product-grid">
                {visibleProducts.map((product, index) => (
                  <ProductCard
                    animationDelay={index * 35}
                    key={product.id}
                    onAddToCart={onAddToCart}
                    product={product}
                    search={location.search}
                  />
                ))}
              </div>
            ) : (
              <div className="state-card empty-state">
                <span className="state-icon">⌕</span>
                <h3>No products found.</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button
                  className="button button-dark"
                  onClick={filters.clearFilters}
                  type="button"
                >
                  Clear filters
                </button>
              </div>
            )}

            {!loading && !error && filteredProducts.length > PAGE_SIZE && (
              <nav aria-label="Product pages" className="pagination">
                <button
                  aria-label="Previous page"
                  className="page-button page-arrow"
                  disabled={currentPage === 1}
                  onClick={() => filters.setPage(currentPage - 1)}
                  type="button"
                >
                  ← <span>Previous</span>
                </button>
                {paginationItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <span
                      aria-hidden="true"
                      className="page-ellipsis"
                      key={`ellipsis-${index}`}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      aria-current={item === currentPage ? "page" : undefined}
                      className={`page-button ${item === currentPage ? "active" : ""}`}
                      key={item}
                      onClick={() => filters.setPage(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  aria-label="Next page"
                  className="page-button page-arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => filters.setPage(currentPage + 1)}
                  type="button"
                >
                  <span>Next</span> →
                </button>
              </nav>
            )}
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <Link className="footer-brand" to="/">
          Amazon
        </Link>
        <span>Shop confidently, every day.</span>
        <span>Product selection powered by DummyJSON.</span>
      </footer>
    </>
  );
}
