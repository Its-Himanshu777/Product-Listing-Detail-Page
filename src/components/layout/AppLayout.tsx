import { useCallback, useEffect, useRef, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import Header from "./Header";
import styles from "./AppLayout.module.css";

function ScrollManager() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (navigationType !== "POP" && typeof window.scrollTo === "function") {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, navigationType]);

  return null;
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [desktopFiltersCollapsed, setDesktopFiltersCollapsed] = useState(false);

  const toggleFilters = useCallback(() => {
    if (location.pathname !== "/") {
      navigate("/");
      return;
    }

    const isMobile =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 900px)").matches;

    if (isMobile) {
      setMobileFiltersOpen((open) => !open);
    } else {
      setDesktopFiltersCollapsed((collapsed) => !collapsed);
    }
  }, [location.pathname, navigate]);

  return (
    <div className={styles.shell}>
      <ScrollManager />
      <Header onToggleFilters={toggleFilters} />
      <main className={styles.main}>
        <ErrorBoundary>
          <Outlet
            context={{
              mobileFiltersOpen,
              desktopFiltersCollapsed,
              setMobileFiltersOpen,
              toggleFilters,
            }}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}
