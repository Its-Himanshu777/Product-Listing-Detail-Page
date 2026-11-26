export default function StarRating({ rating }: { rating: number }) {
  return (
    <span className="rating" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            className={
              index < Math.floor(rating)
                ? "filled"
                : index === Math.floor(rating) && rating % 1 >= 0.5
                  ? "half"
                  : ""
            }
            key={index}
          >
            {index < Math.floor(rating) ||
            (index === Math.floor(rating) && rating % 1 >= 0.5)
              ? "★"
              : "☆"}
          </span>
        ))}
      </span>
      <span className="rating-value">{rating.toFixed(1)}</span>
    </span>
  );
}
