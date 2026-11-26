import { type KeyboardEvent, useEffect, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { isPriceRangeInvalid, parsePriceInput } from "../../lib/filterProducts";

type PriceRangeValue = {
  min: string;
  max: string;
};

type PriceRangeFilterProps = {
  value: PriceRangeValue;
  bounds: { min: number; max: number } | null;
  onChange: (min: string, max: string) => void;
};

function sanitizePriceText(raw: string): string {
  if (!raw.trim()) return "";
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric < 0) return "0";
  return raw;
}

export default function PriceRangeFilter({
  value,
  bounds,
  onChange,
}: PriceRangeFilterProps) {
  const [minInput, setMinInput] = useState(value.min);
  const [maxInput, setMaxInput] = useState(value.max);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value.min !== syncedValue.min || value.max !== syncedValue.max) {
    setSyncedValue(value);
    setMinInput(value.min);
    setMaxInput(value.max);
  }

  const debouncedMin = useDebouncedValue(minInput, 300);
  const debouncedMax = useDebouncedValue(maxInput, 300);

  const parsedLocalMin = parsePriceInput(minInput);
  const parsedLocalMax = parsePriceInput(maxInput);
  const isInvalid = isPriceRangeInvalid(parsedLocalMin, parsedLocalMax);

  useEffect(() => {
    if (debouncedMin !== minInput || debouncedMax !== maxInput) return;

    const nextMin = parsePriceInput(debouncedMin);
    const nextMax = parsePriceInput(debouncedMax);
    const propMin = parsePriceInput(value.min);
    const propMax = parsePriceInput(value.max);

    if (nextMin !== propMin || nextMax !== propMax) {
      onChange(debouncedMin, debouncedMax);
    }
  }, [
    debouncedMin,
    debouncedMax,
    minInput,
    maxInput,
    value.min,
    value.max,
    onChange,
  ]);

  function commitNow() {
    const nextMin = parsePriceInput(minInput);
    const nextMax = parsePriceInput(maxInput);
    const propMin = parsePriceInput(value.min);
    const propMax = parsePriceInput(value.max);

    const normalizedMin = nextMin === undefined ? "" : String(nextMin);
    const normalizedMax = nextMax === undefined ? "" : String(nextMax);
    setMinInput(normalizedMin);
    setMaxInput(normalizedMax);

    if (nextMin !== propMin || nextMax !== propMax) {
      onChange(normalizedMin, normalizedMax);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      commitNow();
    }
  }

  const minPlaceholder = bounds ? `Min (${bounds.min})` : "Min";
  const maxPlaceholder = bounds ? `Max (${bounds.max})` : "Max";

  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 text-sm font-semibold text-ink">Price range</p>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <label className="flex h-[38px] items-center rounded-[6px] border border-line bg-white px-2 focus-within:border-navy">
          <span aria-hidden="true" className="mr-1 text-sm text-muted">
            $
          </span>
          <input
            aria-invalid={isInvalid || undefined}
            aria-label="Minimum price"
            className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
            min="0"
            onBlur={commitNow}
            onChange={(event) =>
              setMinInput(sanitizePriceText(event.target.value))
            }
            onKeyDown={handleKeyDown}
            placeholder={minPlaceholder}
            type="number"
            value={minInput}
          />
        </label>
        <span aria-hidden="true" className="text-xs text-muted">
          to
        </span>
        <label className="flex h-[38px] items-center rounded-[6px] border border-line bg-white px-2 focus-within:border-navy">
          <span aria-hidden="true" className="mr-1 text-sm text-muted">
            $
          </span>
          <input
            aria-invalid={isInvalid || undefined}
            aria-label="Maximum price"
            className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
            min="0"
            onBlur={commitNow}
            onChange={(event) =>
              setMaxInput(sanitizePriceText(event.target.value))
            }
            onKeyDown={handleKeyDown}
            placeholder={maxPlaceholder}
            type="number"
            value={maxInput}
          />
        </label>
      </div>
      {isInvalid ? (
        <p className="m-0 text-xs font-semibold text-danger" role="alert">
          Min can&apos;t be more than max
        </p>
      ) : (
        <p className="m-0 text-xs text-muted">Prices in USD</p>
      )}
    </div>
  );
}
