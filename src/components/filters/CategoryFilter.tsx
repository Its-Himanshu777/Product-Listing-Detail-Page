import type { Category } from "../../types/product";

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
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-semibold text-ink"
        htmlFor="category-filter"
      >
        Category
      </label>
      <div className="relative">
        <select
          className="h-10 w-full cursor-pointer appearance-none rounded-[6px] border border-line bg-white pr-8 pl-3 text-sm"
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
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-[55%] text-muted"
        >
          ⌄
        </span>
      </div>
    </div>
  );
}
