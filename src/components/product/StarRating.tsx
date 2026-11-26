import styles from "./StarRating.module.css";

type StarRatingProps = {
  rating: number;
};

export default function StarRating({ rating }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <span
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
      className={styles.rating}
    >
      <span aria-hidden="true" className={styles.stars}>
        {Array.from({ length: 5 }, (_, index) => {
          const isFilled =
            index < fullStars || (index === fullStars && hasHalfStar);
          return (
            <span
              className={isFilled ? styles.filled : styles.empty}
              key={index}
            >
              {isFilled ? "★" : "☆"}
            </span>
          );
        })}
      </span>
      <span className={styles.value}>{rating.toFixed(1)}</span>
    </span>
  );
}
