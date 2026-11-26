import Button from "./Button";
import styles from "./StateCard.module.css";

type EmptyStateProps = {
  title?: string;
  message?: string;
  onReset?: () => void;
  resetLabel?: string;
};

export default function EmptyState({
  title = "No products match these filters",
  message = "Try adjusting your price range, brand selection, or category.",
  onReset,
  resetLabel = "Clear filters",
}: EmptyStateProps) {
  return (
    <div className={styles.card}>
      <span aria-hidden="true" className={`${styles.icon} ${styles.emptyIcon}`}>
        ⌕
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onReset && (
        <div className={styles.actions}>
          <Button onClick={onReset}>{resetLabel}</Button>
        </div>
      )}
    </div>
  );
}
