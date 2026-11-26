import { getPaginationItems } from "../../lib/filterProducts";
import styles from "./Pagination.module.css";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav aria-label="Product pages" className={styles.nav}>
      <button
        aria-label="Previous page"
        className={`${styles.button} ${styles.arrow}`}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        ← <span>Previous</span>
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            aria-hidden="true"
            className={styles.ellipsis}
            key={`ellipsis-${index}`}
          >
            …
          </span>
        ) : (
          <button
            aria-current={item === currentPage ? "page" : undefined}
            className={`${styles.button} ${item === currentPage ? styles.active : ""}`}
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
        className={`${styles.button} ${styles.arrow}`}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <span>Next</span> →
      </button>
    </nav>
  );
}
