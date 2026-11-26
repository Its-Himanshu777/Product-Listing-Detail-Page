import type { BrandOption } from "../../lib/filterProducts";
import type { Category } from "../../types/product";
import Button from "../ui/Button";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import PriceRangeFilter from "./PriceRangeFilter";
import styles from "./FilterPanel.module.css";

type FilterPanelProps = {
  categories: Category[];
  brands: BrandOption[];
  priceBounds: { min: number; max: number } | null;
  category: string;
  minPrice: string;
  maxPrice: string;
  selectedBrands: string[];
  isOpen: boolean;
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
  onClose,
  onCategoryChange,
  onPriceChange,
  onBrandsChange,
  onClearAll,
}: FilterPanelProps) {
  return (
    <aside
      aria-label="Product filters"
      className={`${styles.panel} ${isOpen ? styles.open : ""}`}
      id="filters"
    >
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>NARROW YOUR SEARCH</span>
          <h2 className={styles.title}>Filters</h2>
        </div>
        <div className={styles.headingActions}>
          <Button onClick={onClearAll} variant="ghost">
            Clear all
          </Button>
          <Button
            className={styles.mobileClose}
            onClick={onClose}
            variant="secondary"
          >
            Done
          </Button>
        </div>
      </div>

      <CategoryFilter
        categories={categories}
        onChange={onCategoryChange}
        value={category}
      />

      <div className={styles.divider} />

      <PriceRangeFilter
        bounds={priceBounds}
        onChange={onPriceChange}
        value={{ min: minPrice, max: maxPrice }}
      />

      <div className={styles.divider} />

      <BrandFilter
        brands={brands}
        onChange={onBrandsChange}
        value={selectedBrands}
      />
    </aside>
  );
}
