import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
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
  return (
    <div className={styles.shell}>
      <ScrollManager />
      <Header />
      <main className={styles.main}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
