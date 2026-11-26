import type { BrandOption } from "../../lib/filterProducts";
import styles from "./FilterPanel.module.css";

type BrandFilterProps = {
  value: string[];
  brands: BrandOption[];
  onChange: (brands: string[]) => void;
};

export default function BrandFilter({
  value,
  brands,
  onChange,
}: BrandFilterProps) {
  function handleToggle(brandName: string) {
    if (value.includes(brandName)) {
      onChange(value.filter((item) => item !== brandName));
    } else {
      onChange([...value, brandName]);
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.subheading}>
        <p className={styles.label}>Brand</p>
        <span className={styles.countBadge}>{brands.length}</span>
      </div>
      {brands.length === 0 ? (
        <p className={styles.emptyBrands}>No brands in this category</p>
      ) : (
        <div className={styles.brandList}>
          {brands.map((brand) => {
            const checked = value.includes(brand.name);
            return (
              <label className={styles.checkOption} key={brand.name}>
                <input
                  checked={checked}
                  className={styles.checkbox}
                  onChange={() => handleToggle(brand.name)}
                  type="checkbox"
                />
                <span className={styles.brandName}>{brand.name}</span>
                <span className={styles.brandCount}>({brand.count})</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
