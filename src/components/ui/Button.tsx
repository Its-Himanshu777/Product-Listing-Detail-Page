import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "min-h-10 px-4 bg-navy text-white border border-transparent hover:bg-[#234366]",
  secondary:
    "min-h-10 px-4 bg-white text-ink border border-line hover:bg-surface",
  ghost:
    "min-h-0 px-0 py-1 bg-transparent text-green border border-transparent hover:underline",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[6px] text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`.trim()}
      type={type}
      {...props}
    />
  );
}
