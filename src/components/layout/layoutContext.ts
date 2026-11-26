import { useOutletContext } from "react-router-dom";

export type AppLayoutContext = {
  mobileFiltersOpen: boolean;
  desktopFiltersCollapsed: boolean;
  setMobileFiltersOpen: (open: boolean) => void;
  toggleFilters: () => void;
};

export function useAppLayoutContext(): AppLayoutContext {
  return useOutletContext<AppLayoutContext>();
}
