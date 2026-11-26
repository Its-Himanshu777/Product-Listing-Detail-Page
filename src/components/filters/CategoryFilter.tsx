import { useState } from "react";
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
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const visibleCategories = normalizedSearch
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(normalizedSearch),
      )
    : categories;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex h-9 items-center gap-2 rounded-[6px] border border-line bg-white px-2.5 focus-within:border-blue-500">
        <span aria-hidden="true" className="inline-flex shrink-0 text-muted">
          <svg
            fill="none"
            height="14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="14"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="20" x2="16.65" y1="20" y2="16.65" />
          </svg>
        </span>
        <input
          aria-label="Filter categories"
          className="w-full min-w-0 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search..."
          type="search"
          value={search}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="m-0 text-sm font-semibold text-ink">Categories</p>
        {value && (
          <button
            className="cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-blue-600 hover:underline"
            onClick={() => onChange("")}
            type="button"
          >
            Reset
          </button>
        )}
      </div>

      {visibleCategories.length === 0 ? (
        <p className="m-0 text-sm text-muted">No matching categories</p>
      ) : (
        <div
          aria-label="Categories"
          className="flex max-h-[240px] flex-col gap-2 overflow-y-auto pr-1"
          role="group"
        >
          {visibleCategories.map((category) => {
            const checked = value === category.slug;
            return (
              <label
                className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-ink"
                key={category.slug}
              >
                <input
                  checked={checked}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded accent-blue-600"
                  onChange={() => onChange(checked ? "" : category.slug)}
                  type="checkbox"
                />
                <span className="min-w-0 flex-1 truncate">{category.name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
