import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import { formatPrice } from "../../lib/format";
import Button from "../ui/Button";

type PanelId = "cart" | "activity" | "account";

export default function HeaderActions() {
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [signedInUser, setSignedInUser] = useState<string | null>(null);
  const [accountError, setAccountError] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const recentProducts = useRecentlyViewed();

  useEffect(() => {
    if (!openPanel) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenPanel(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPanel(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPanel]);

  function togglePanel(panel: PanelId) {
    setAccountError("");
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = accountEmail.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setAccountError("Please enter a valid email address.");
      return;
    }
    setSignedInUser(trimmed);
    setAccountEmail("");
    setAccountError("");
  }

  const iconButtonBase =
    "relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[6px] border-0 bg-transparent text-white/90 transition-colors hover:bg-white/12 hover:text-white focus-visible:outline-white";

  return (
    <div
      className="relative flex items-center gap-1 sm:gap-2"
      ref={containerRef}
    >
      <button
        aria-controls="header-cart-popover"
        aria-expanded={openPanel === "cart"}
        aria-label="Shopping cart"
        className={`${iconButtonBase} ${openPanel === "cart" ? "bg-white/15 text-white" : ""}`}
        onClick={() => togglePanel("cart")}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="currentColor"
          height="20"
          viewBox="0 0 24 24"
          width="20"
        >
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.17 14.75l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25Z" />
        </svg>
      </button>

      <button
        aria-controls="header-activity-popover"
        aria-expanded={openPanel === "activity"}
        aria-label="Recently viewed products"
        className={`${iconButtonBase} ${openPanel === "activity" ? "bg-white/15 text-white" : ""}`}
        onClick={() => togglePanel("activity")}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="20"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="20"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v9l6.36 6.36" fill="currentColor" stroke="none" />
          <path
            d="M12 3a9 9 0 0 1 9 9h-9V3Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
        {recentProducts.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-400" />
        )}
      </button>

      <button
        aria-controls="header-account-popover"
        aria-expanded={openPanel === "account"}
        aria-label="Account"
        className={`${iconButtonBase} ${openPanel === "account" ? "bg-white/15 text-white" : ""}`}
        onClick={() => togglePanel("account")}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="currentColor"
          height="20"
          viewBox="0 0 24 24"
          width="20"
        >
          <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
        </svg>
      </button>

      {openPanel === "cart" && (
        <div
          aria-label="Shopping cart summary"
          className="absolute top-12 right-0 z-30 w-72 rounded-[12px] border border-line bg-white p-4 text-ink shadow-[0_12px_32px_rgba(24,48,74,0.16)]"
          id="header-cart-popover"
          role="dialog"
        >
          <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
            <h2 className="m-0 font-display text-sm font-bold">Cart</h2>
            <span className="text-xs font-medium text-muted">0 items</span>
          </div>
          <p className="m-0 text-sm text-muted">
            Your cart is currently empty. Browse the catalog to inspect product
            details.
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs font-medium text-muted">Subtotal</span>
            <strong className="font-display text-base font-bold text-navy">
              {formatPrice(0)}
            </strong>
          </div>
          <div className="mt-3">
            <Link
              className="inline-flex min-h-9 w-full items-center justify-center rounded-[6px] bg-navy px-3 text-xs font-semibold text-white hover:bg-[#234366]"
              onClick={() => setOpenPanel(null)}
              to="/"
            >
              Browse products
            </Link>
          </div>
        </div>
      )}

      {openPanel === "activity" && (
        <div
          aria-label="Recently viewed products"
          className="absolute top-12 right-0 z-30 w-80 rounded-[12px] border border-line bg-white p-4 text-ink shadow-[0_12px_32px_rgba(24,48,74,0.16)]"
          id="header-activity-popover"
          role="dialog"
        >
          <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
            <h2 className="m-0 font-display text-sm font-bold">
              Recently viewed
            </h2>
            <span className="text-xs font-medium text-muted">
              {recentProducts.length}
            </span>
          </div>
          {recentProducts.length === 0 ? (
            <p className="m-0 text-sm text-muted">
              Products you open will appear here for quick access.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {recentProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    className="flex items-center gap-3 rounded-[8px] p-1.5 transition-colors hover:bg-surface"
                    onClick={() => setOpenPanel(null)}
                    to={`/product/${product.id}`}
                  >
                    <img
                      alt=""
                      className="h-10 w-10 shrink-0 rounded bg-surface object-contain p-1"
                      src={product.thumbnail}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {product.title}
                      </span>
                      <span className="block text-xs font-semibold text-navy">
                        {formatPrice(product.price)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {openPanel === "account" && (
        <div
          aria-label="Account"
          className="absolute top-12 right-0 z-30 w-72 rounded-[12px] border border-line bg-white p-4 text-ink shadow-[0_12px_32px_rgba(24,48,74,0.16)]"
          id="header-account-popover"
          role="dialog"
        >
          <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
            <h2 className="m-0 font-display text-sm font-bold">Account</h2>
            <span className="text-xs font-medium text-muted">
              {signedInUser ? "Signed in" : "Guest"}
            </span>
          </div>

          {signedInUser ? (
            <div className="flex flex-col gap-3">
              <p className="m-0 text-sm text-ink">
                Signed in as{" "}
                <strong className="break-all">{signedInUser}</strong>
              </p>
              <Button
                className="w-full"
                onClick={() => setSignedInUser(null)}
                variant="secondary"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <form
              className="flex flex-col gap-3"
              onSubmit={handleAccountSubmit}
            >
              <label className="flex flex-col gap-1 text-xs font-semibold text-ink">
                Email address
                <input
                  className="h-9 rounded-[6px] border border-line bg-white px-2.5 text-sm font-normal text-ink focus:border-navy focus:outline-none"
                  onChange={(event) => {
                    setAccountEmail(event.target.value);
                    if (accountError) setAccountError("");
                  }}
                  placeholder="you@example.com"
                  type="email"
                  value={accountEmail}
                />
              </label>
              {accountError && (
                <p
                  className="m-0 text-xs font-semibold text-danger"
                  role="alert"
                >
                  {accountError}
                </p>
              )}
              <Button className="w-full" type="submit">
                Sign in
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
