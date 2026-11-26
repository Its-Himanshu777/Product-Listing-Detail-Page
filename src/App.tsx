import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import CartDialog from "./components/CartDialog";
import LocationDialog from "./components/LocationDialog";
import ListingPage from "./pages/ListingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import type { CartItem, Product } from "./types";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  function addToCart(product: Product, quantity = 1) {
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...items, { product, quantity }];
    });
    setCartOpen(true);
  }

  function changeCartQuantity(productId: number, amount: number) {
    setCart((items) =>
      items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  return (
    <>
      <Routes>
        <Route
          element={
            <ListingPage
              cartCount={cartCount}
              deliveryLocation={deliveryLocation}
              onAddToCart={addToCart}
              onOpenCart={() => setCartOpen(true)}
              onOpenLocation={() => setLocationOpen(true)}
            />
          }
          path="/"
        />
        <Route
          element={
            <ProductDetailPage
              cartCount={cartCount}
              deliveryLocation={deliveryLocation}
              onAddToCart={addToCart}
              onOpenCart={() => setCartOpen(true)}
              onOpenLocation={() => setLocationOpen(true)}
            />
          }
          path="/product/:id"
        />
      </Routes>
      {cartOpen && (
        <CartDialog
          items={cart}
          onChangeQuantity={changeCartQuantity}
          onClose={() => setCartOpen(false)}
          onRemove={(productId) =>
            setCart((items) =>
              items.filter((item) => item.product.id !== productId),
            )
          }
        />
      )}
      {locationOpen && (
        <LocationDialog
          currentLocation={deliveryLocation}
          onChange={(location) => setDeliveryLocation(location.trim())}
          onClose={() => setLocationOpen(false)}
          onSave={(location) => {
            setDeliveryLocation(location);
            setLocationOpen(false);
          }}
        />
      )}
    </>
  );
}
