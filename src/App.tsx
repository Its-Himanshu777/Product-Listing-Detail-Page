import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ListingPage from "./pages/ListingPage";
import NotFound from "./pages/NotFound";
import ProductDetailPage from "./pages/ProductDetailPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ListingPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
