import { getPaginationItems } from "../../lib/filterProducts";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const baseButtonClasses =
  "inline-flex h-[38px] min-w-[38px] items-center justify-center gap-1 rounded-[6px] border px-3 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav
      aria-label="Product pages"
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        aria-label="Previous page"
        className={`${baseButtonClasses} border-line bg-white hover:bg-surface disabled:hover:bg-white`}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        ← <span className="hidden sm:inline">Previous</span>
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            aria-hidden="true"
            className="px-1 text-muted"
            key={`ellipsis-${index}`}
          >
            …
          </span>
        ) : (
          <button
            aria-current={item === currentPage ? "page" : undefined}
            className={`${baseButtonClasses} ${
              item === currentPage
                ? "border-navy bg-navy text-white"
                : "border-line bg-white hover:bg-surface"
            }`}
            key={item}
            onClick={() => onPageChange(item)}
            type="button"
          >
            {item}
          </button>
        ),
      )}

      <button
        aria-label="Next page"
        className={`${baseButtonClasses} border-line bg-white hover:bg-surface disabled:hover:bg-white`}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <span className="hidden sm:inline">Next</span> →
      </button>
    </nav>
  );
}
