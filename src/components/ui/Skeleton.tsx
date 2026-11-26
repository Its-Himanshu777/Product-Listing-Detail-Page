import styles from "./Skeleton.module.css";

type SkeletonProps = {
  count?: number;
};

export default function Skeleton({ count = 8 }: SkeletonProps) {
  return (
    <div
      aria-label="Loading products"
      aria-live="polite"
      className={styles.grid}
    >
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.card} key={index}>
          <div className={styles.image} />
          <div className={styles.line} />
          <div className={`${styles.line} ${styles.short}`} />
          <div className={`${styles.line} ${styles.price}`} />
        </div>
      ))}
    </div>
  );
}
