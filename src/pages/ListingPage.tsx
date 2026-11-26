import { useMemo } from "react";
import { getErrorMessage } from "../api/http";
import FilterPanel from "../components/filters/FilterPanel";
import { useAppLayoutContext } from "../components/layout/layoutContext";
import ProductGrid from "../components/product/ProductGrid";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Pagination from "../components/ui/Pagination";
import Skeleton from "../components/ui/Skeleton";
import { useCategories } from "../hooks/useCategories";
import { useFilterParams } from "../hooks/useFilterParams";
import { useProducts } from "../hooks/useProducts";
import {
  extractBrands,
  filterProducts,
  getPriceBounds,
  PAGE_SIZE,
  paginate,
  parsePriceInput,
} from "../lib/filterProducts";

export default function ListingPage() {
  const filters = useFilterParams();
  const { products, loading, error, retry } = useProducts(filters.category);
  const { categories } = useCategories();
  const { mobileFiltersOpen, desktopFiltersCollapsed, setMobileFiltersOpen } =
    useAppLayoutContext();

  const brands = useMemo(() => extractBrands(products), [products]);
  const priceBounds = useMemo(() => getPriceBounds(products), [products]);

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, {
        min: parsePriceInput(filters.minPrice),
        max: parsePriceInput(filters.maxPrice),
        brands: filters.brands,
        query: filters.query,
      }),
    [
      products,
      filters.minPrice,
      filters.maxPrice,
      filters.brands,
      filters.query,
    ],
  );

  const {
    items: visibleProducts,
    current: currentPage,
    totalPages,
  } = useMemo(
    () => paginate(filteredProducts, filters.page, PAGE_SIZE),
    [filteredProducts, filters.page],
  );

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.query ? 1 : 0) +
    filters.brands.length;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-1">
        <p className="m-0 text-xs font-bold tracking-[0.08em] text-green">
          PRODUCT CATALOG
        </p>
        <h1 className="m-0 font-display text-[1.75rem] font-extrabold tracking-tight">
          Browse products
        </h1>
      </section>

      <div
        className={`grid grid-cols-1 items-start gap-6 ${
          desktopFiltersCollapsed
            ? "lg:grid-cols-1"
            : "lg:grid-cols-[270px_minmax(0,1fr)]"
        }`}
      >
        <FilterPanel
          brands={brands}
          categories={categories}
          category={filters.category}
          desktopCollapsed={desktopFiltersCollapsed}
          isOpen={mobileFiltersOpen}
          maxPrice={filters.maxPrice}
          minPrice={filters.minPrice}
          onBrandsChange={filters.setBrands}
          onCategoryChange={filters.setCategory}
          onClearAll={filters.clearFilters}
          onClose={() => setMobileFiltersOpen(false)}
          onPriceChange={filters.setPriceRange}
          priceBounds={priceBounds}
          selectedBrands={filters.brands}
        />

        <section aria-label="Product results" className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="m-0 text-sm font-medium text-muted" role="status">
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1 ? "result" : "results"
                  }`}
            </p>
            <Button
              aria-controls="filters"
              aria-expanded={mobileFiltersOpen}
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              variant="secondary"
            >
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-navy px-1.5 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {error ? (
            <ErrorState
              message={getErrorMessage(error)}
              onRetry={retry}
              title="We couldn't load the products."
            />
          ) : loading ? (
            <Skeleton count={8} />
          ) : visibleProducts.length > 0 ? (
            <>
              <ProductGrid products={visibleProducts} />
              <Pagination
                currentPage={currentPage}
                onPageChange={filters.setPage}
                totalPages={totalPages}
              />
            </>
          ) : (
            <EmptyState onReset={filters.clearFilters} />
          )}
        </section>
      </div>
    </div>
  );
}
