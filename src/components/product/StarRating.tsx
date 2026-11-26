type StarRatingProps = {
  rating: number;
};

export default function StarRating({ rating }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <span
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
      className="inline-flex items-center gap-2 text-sm"
    >
      <span aria-hidden="true" className="inline-flex gap-px tracking-wide">
        {Array.from({ length: 5 }, (_, index) => {
          const isFilled =
            index < fullStars || (index === fullStars && hasHalfStar);
          return (
            <span
              className={isFilled ? "text-star" : "text-slate-300"}
              key={index}
            >
              {isFilled ? "★" : "☆"}
            </span>
          );
        })}
      </span>
      <span className="font-medium text-muted">({rating.toFixed(1)})</span>
    </span>
  );
}
