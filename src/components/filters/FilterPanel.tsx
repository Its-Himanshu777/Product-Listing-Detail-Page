import type { BrandOption } from "../../lib/filterProducts";
import type { Category } from "../../types/product";
import Button from "../ui/Button";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import PriceRangeFilter from "./PriceRangeFilter";

type FilterPanelProps = {
  categories: Category[];
  brands: BrandOption[];
  priceBounds: { min: number; max: number } | null;
  category: string;
  minPrice: string;
  maxPrice: string;
  selectedBrands: string[];
  isOpen: boolean;
  desktopCollapsed?: boolean;
  onClose: () => void;
  onCategoryChange: (category: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onBrandsChange: (brands: string[]) => void;
  onClearAll: () => void;
};

export default function FilterPanel({
  categories,
  brands,
  priceBounds,
  category,
  minPrice,
  maxPrice,
  selectedBrands,
  isOpen,
  desktopCollapsed = false,
  onClose,
  onCategoryChange,
  onPriceChange,
  onBrandsChange,
  onClearAll,
}: FilterPanelProps) {
  return (
    <aside
      aria-label="Product filters"
      className={`${isOpen ? "block" : "hidden"} fixed inset-0 z-30 overflow-y-auto bg-white p-5 ${
        desktopCollapsed ? "lg:hidden" : "lg:block"
      } lg:static lg:z-auto lg:sticky lg:top-[84px] lg:self-start lg:rounded-[14px] lg:border lg:border-line lg:shadow-[0_2px_8px_rgba(24,48,74,0.05)]`}
      id="filters"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <span className="block text-xs font-bold tracking-[0.06em] text-green">
            NARROW YOUR SEARCH
          </span>
          <h2 className="mt-0.5 mb-0 font-display text-lg font-bold">
            Filters
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onClearAll} variant="ghost">
            Clear all
          </Button>
          <Button className="lg:hidden" onClick={onClose} variant="secondary">
            Done
          </Button>
        </div>
      </div>

      <CategoryFilter
        categories={categories}
        onChange={onCategoryChange}
        value={category}
      />

      <div className="my-4 h-px bg-line" />

      <PriceRangeFilter
        bounds={priceBounds}
        onChange={onPriceChange}
        value={{ min: minPrice, max: maxPrice }}
      />

      <div className="my-4 h-px bg-line" />

      <BrandFilter
        brands={brands}
        onChange={onBrandsChange}
        value={selectedBrands}
      />
    </aside>
  );
}
