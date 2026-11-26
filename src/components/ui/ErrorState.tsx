import Button from "./Button";

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
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-line bg-white px-6 py-10 text-center"
      role="alert"
    >
      <span
        aria-hidden="true"
        className="grid h-11 w-11 place-items-center rounded-full border border-danger-border bg-danger-soft text-lg font-bold text-danger"
      >
        !
      </span>
      <h3 className="m-0 font-display text-lg font-bold">{title}</h3>
      <p className="m-0 max-w-[44ch] text-sm text-muted">{message}</p>
      {(onRetry || onBack) && (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
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
