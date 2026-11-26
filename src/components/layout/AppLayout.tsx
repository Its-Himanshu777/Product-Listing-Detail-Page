import { useCallback, useEffect, useRef, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import Header from "./Header";

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
      window.matchMedia("(max-width: 1023px)").matches;

    if (isMobile) {
      setMobileFiltersOpen((open) => !open);
    } else {
      setDesktopFiltersCollapsed((collapsed) => !collapsed);
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollManager />
      <Header onToggleFilters={toggleFilters} />
      <main className="mx-auto w-full max-w-[1320px] flex-1 px-5 pt-6 pb-10">
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
