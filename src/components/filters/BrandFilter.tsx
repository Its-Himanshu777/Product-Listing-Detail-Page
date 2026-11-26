import type { BrandOption } from "../../lib/filterProducts";

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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="m-0 text-sm font-semibold text-ink">Brand</p>
        <span className="text-xs font-semibold text-muted">
          {brands.length}
        </span>
      </div>
      {brands.length === 0 ? (
        <p className="m-0 text-sm text-muted">No brands in this category</p>
      ) : (
        <div className="-mx-1 flex max-h-[280px] flex-col gap-2 overflow-y-auto p-1">
          {brands.map((brand) => {
            const checked = value.includes(brand.name);
            return (
              <label
                className="flex cursor-pointer items-center gap-2 py-0.5 text-sm"
                key={brand.name}
              >
                <input
                  checked={checked}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                  onChange={() => handleToggle(brand.name)}
                  type="checkbox"
                />
                <span className="min-w-0 flex-1 truncate">{brand.name}</span>
                <span className="text-xs text-muted">({brand.count})</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
