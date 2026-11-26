import { useCallback, useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import CartDialog from "./components/CartDialog";
import LocationDialog from "./components/LocationDialog";
import ListingPage from "./pages/ListingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import type { CartItem, LocationStatus, Product } from "./types";
import { reverseGeocode } from "./utils";

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was denied by your browser or device settings. Enable Location for Safari/Chrome (then tap 'Use current location'), or enter your city or postal code manually.";
    case error.POSITION_UNAVAILABLE:
      return "Your location is currently unavailable. Please enter your city or postal code manually.";
    case error.TIMEOUT:
      return "Location request timed out. Please try again or enter your location manually.";
    default:
      return "Could not detect your location. Please enter it manually.";
  }
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const manualLocationOverrideRef = useRef(false);
  const geocodeAbortRef = useRef<AbortController | null>(null);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const detectCurrentLocation = useCallback((isManualRetry = false) => {
    if (
      typeof navigator === "undefined" ||
      !("geolocation" in navigator) ||
      typeof navigator.geolocation.getCurrentPosition !== "function"
    ) {
      setLocationStatus("error");
      setLocationError(
        "Geolocation is not supported by your browser. Please enter your location manually.",
      );
      return;
    }

    if (isManualRetry) {
      manualLocationOverrideRef.current = false;
    }

    geocodeAbortRef.current?.abort();
    setLocationStatus("loading");
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const controller = new AbortController();
        geocodeAbortRef.current = controller;

        void reverseGeocode(
          position.coords.latitude,
          position.coords.longitude,
          controller.signal,
        )
          .then((address) => {
            if (controller.signal.aborted) return;
            if (isManualRetry || !manualLocationOverrideRef.current) {
              setDeliveryLocation(address);
            }
            setLocationStatus("success");
            setLocationError("");
          })
          .catch(() => {
            if (controller.signal.aborted) return;
            setLocationStatus("error");
            setLocationError(
              "Detected your coordinates, but could not find a readable address. Please enter your location manually.",
            );
          });
      },
      (geoError) => {
        setLocationStatus("error");
        setLocationError(getGeolocationErrorMessage(geoError));
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: isManualRetry ? 0 : 300000,
      },
    );
  }, []);

  useEffect(() => {
    detectCurrentLocation(false);
    return () => {
      geocodeAbortRef.current?.abort();
    };
  }, [detectCurrentLocation]);

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
              locationStatus={locationStatus}
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
              locationStatus={locationStatus}
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
          locationError={locationError}
          locationStatus={locationStatus}
          onChange={(location) => {
            manualLocationOverrideRef.current = true;
            setDeliveryLocation(location.trim());
            if (location.trim()) setLocationError("");
          }}
          onClose={() => setLocationOpen(false)}
          onDetectLocation={() => detectCurrentLocation(true)}
          onSave={(location) => {
            manualLocationOverrideRef.current = true;
            setDeliveryLocation(location);
            setLocationStatus("success");
            setLocationError("");
            setLocationOpen(false);
          }}
        />
      )}
    </>
  );
}
