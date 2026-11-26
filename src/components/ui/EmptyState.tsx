import Button from "./Button";

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
    <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-line bg-white px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className="grid h-11 w-11 place-items-center rounded-full bg-surface text-lg font-bold text-muted"
      >
        ⌕
      </span>
      <h3 className="m-0 font-display text-lg font-bold">{title}</h3>
      <p className="m-0 max-w-[44ch] text-sm text-muted">{message}</p>
      {onReset && (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button onClick={onReset}>{resetLabel}</Button>
        </div>
      )}
    </div>
  );
}
