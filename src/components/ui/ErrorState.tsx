import Button from "./Button";
import styles from "./StateCard.module.css";

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
};

export default function ErrorState({
  title,
  message,
  onRetry,
  onBack,
  backLabel = "← Back to results",
}: ErrorStateProps) {
  return (
    <div className={styles.card} role="alert">
      <span aria-hidden="true" className={`${styles.icon} ${styles.errorIcon}`}>
        !
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {(onRetry || onBack) && (
        <div className={styles.actions}>
          {onRetry && <Button onClick={onRetry}>Try again</Button>}
          {onBack && (
            <Button
              onClick={onBack}
              variant={onRetry ? "secondary" : "primary"}
            >
              {backLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
