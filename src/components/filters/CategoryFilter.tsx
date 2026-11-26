import type { Category } from "../../types/product";
import styles from "./FilterPanel.module.css";

type CategoryFilterProps = {
  value: string;
  categories: Category[];
  onChange: (category: string) => void;
};

export default function CategoryFilter({
  value,
  categories,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className={styles.section}>
      <label className={styles.label} htmlFor="category-filter">
        Category
      </label>
      <div className={styles.selectWrap}>
        <select
          className={styles.select}
          id="category-filter"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className={styles.selectArrow}>
          ⌄
        </span>
      </div>
    </div>
  );
}
