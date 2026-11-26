import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import styles from "./Header.module.css";

type HeaderProps = {
  onToggleFilters: () => void;
};

export default function Header({ onToggleFilters }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isListingPage = location.pathname === "/";
  const urlQuery = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);

  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setInputValue(urlQuery);
  }

  const debouncedQuery = useDebouncedValue(inputValue, 300);

  useEffect(() => {
    if (!isListingPage) return;
    if (debouncedQuery !== inputValue) return;

    const trimmed = debouncedQuery.trim();
    if (trimmed === urlQuery) return;

    const next = new URLSearchParams(searchParams);
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");
    setSearchParams(next, { replace: true });
  }, [
    debouncedQuery,
    inputValue,
    isListingPage,
    searchParams,
    setSearchParams,
    urlQuery,
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = inputValue.trim();
    const next = new URLSearchParams(isListingPage ? searchParams : undefined);
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");

    if (isListingPage) {
      setSearchParams(next, { replace: true });
    } else {
      const search = next.toString();
      navigate({ pathname: "/", search: search ? `?${search}` : "" });
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          aria-label="Toggle filters"
          className={styles.menuButton}
          onClick={onToggleFilters}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="22"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
            width="22"
          >
            <line x1="4" x2="20" y1="7" y2="7" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="17" y2="17" />
          </svg>
        </button>

        <form
          className={styles.searchForm}
          onSubmit={handleSubmit}
          role="search"
        >
          <span aria-hidden="true" className={styles.searchIcon}>
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="20" x2="16.65" y1="20" y2="16.65" />
            </svg>
          </span>
          <input
            aria-label="Search products"
            className={styles.searchInput}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search products..."
            type="search"
            value={inputValue}
          />
        </form>

        <div aria-hidden="true" className={styles.actions}>
          <span className={styles.iconSlot}>
            <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.17 14.75l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25Z" />
            </svg>
          </span>
          <span className={styles.iconSlot}>
            <svg
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
          </span>
          <span className={styles.iconSlot}>
            <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
              <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
            </svg>
          </span>
        </div>
      </div>
    </header>
  );
}
