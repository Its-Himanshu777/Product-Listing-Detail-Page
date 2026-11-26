import { type PointerEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import StarRating from "../components/StarRating";
import type { Product } from "../types";
import { API_URL, currency, fetchJson, getErrorMessage } from "../utils";

type ProductDetailPageProps = {
  cartCount: number;
  onOpenCart: () => void;
  deliveryLocation: string;
  onOpenLocation: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
};

export default function ProductDetailPage({
  cartCount,
  onOpenCart,
  deliveryLocation,
  onOpenLocation,
  onAddToCart,
}: ProductDetailPageProps) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [is360View, setIs360View] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dragState = useRef<{
    startX: number;
    startIndex: number;
    currentFrame: number;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProduct() {
      setLoading(true);
      setError("");
      try {
        const response = await fetchJson<Product>(
          `${API_URL}/products/${encodeURIComponent(id ?? "")}`,
          controller.signal,
        );
        setSelectedImageIndex(0);
        setIs360View(false);
        setQuantity(1);
        setProduct(response);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadProduct();
    return () => controller.abort();
  }, [id]);

  const discountPercentage = Math.round(product?.discountPercentage ?? 0);
  const listPrice =
    product && discountPercentage > 0 && discountPercentage < 100
      ? product.price / (1 - discountPercentage / 100)
      : null;
  const availableImages = product
    ? product.images?.length
      ? product.images
      : [product.thumbnail]
    : [];
  const selectedImage =
    availableImages[selectedImageIndex] ?? product?.thumbnail ?? "";
  const canRotate = availableImages.length > 1;

  function changeRotation(step: number) {
    if (!canRotate) return;
    setSelectedImageIndex(
      (selectedImageIndex + step + availableImages.length) %
        availableImages.length,
    );
  }

  function handleViewerPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!is360View || !canRotate) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      startX: event.clientX,
      startIndex: selectedImageIndex,
      currentFrame: 0,
    };
  }

  function handleViewerPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    if (!is360View || !canRotate || !drag) return;
    const frame = Math.trunc((event.clientX - drag.startX) / 35);
    if (frame === drag.currentFrame) return;
    drag.currentFrame = frame;
    setSelectedImageIndex(
      (drag.startIndex - frame + availableImages.length) %
        availableImages.length,
    );
  }

  function handleViewerPointerUp() {
    dragState.current = null;
  }

  return (
    <>
      <Header
        category={new URLSearchParams(location.search).get("category") ?? ""}
        onCategoryChange={(value) => {
          const next = new URLSearchParams(location.search);
          if (value) next.set("category", value);
          else next.delete("category");
          navigate(
            { pathname: "/", search: next.toString() },
            { replace: true },
          );
        }}
        query={new URLSearchParams(location.search).get("q") ?? ""}
        onQueryChange={(value) => {
          const next = new URLSearchParams(location.search);
          if (value) next.set("q", value);
          else next.delete("q");
          navigate(
            { pathname: location.pathname, search: next.toString() },
            { replace: true },
          );
        }}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        deliveryLocation={deliveryLocation}
        onOpenLocation={onOpenLocation}
      />
      <main className="page-shell detail-shell">
        <nav aria-label="Breadcrumb" className="detail-breadcrumb">
          <button
            onClick={() =>
              navigate({ pathname: "/", search: location.search })
            }
            type="button"
          >
            All products
          </button>
          {product && (
            <>
              <span aria-hidden="true">›</span>
              <span>{product.category.replace(/-/g, " ")}</span>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{product.title}</span>
            </>
          )}
        </nav>
        {loading ? (
          <div className="detail-loading" aria-live="polite">
            Finding the details...
          </div>
        ) : error ? (
          <div className="state-card error-state" role="alert">
            <span className="state-icon">!</span>
            <h3>We couldn&apos;t load this product.</h3>
            <p>{error}</p>
            <button
              className="button button-dark"
              onClick={() =>
                navigate({ pathname: "/", search: location.search })
              }
              type="button"
            >
              Back to products
            </button>
          </div>
        ) : product ? (
          <>
            <article className="detail-product-grid">
              <section
                aria-label="Product images"
                className="detail-product-gallery"
              >
                <div className="detail-gallery-stage">
                  <div
                    aria-label="Product images"
                    className="detail-thumbnails"
                  >
                    {availableImages.slice(0, 6).map((image, index) => (
                      <button
                        aria-label={`Show product image ${index + 1}`}
                        aria-pressed={selectedImageIndex === index}
                        className={`detail-image-choice${selectedImageIndex === index ? " is-selected" : ""}`}
                        key={`${image}-${index}`}
                        onClick={() => setSelectedImageIndex(index)}
                        type="button"
                      >
                        <img alt="" src={image} />
                      </button>
                    ))}
                  </div>
                  <div
                    aria-label={
                      is360View
                        ? "360 degree product image viewer. Drag horizontally or use the arrow keys to rotate."
                        : "Product image"
                    }
                    className={`detail-main-image${is360View ? " is-360-view" : ""}`}
                    onKeyDown={(event) => {
                      if (!is360View) return;
                      if (event.key === "ArrowRight") {
                        event.preventDefault();
                        changeRotation(1);
                      } else if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        changeRotation(-1);
                      }
                    }}
                    onPointerCancel={handleViewerPointerUp}
                    onPointerDown={handleViewerPointerDown}
                    onPointerMove={handleViewerPointerMove}
                    onPointerUp={handleViewerPointerUp}
                    role="group"
                    tabIndex={is360View ? 0 : undefined}
                  >
                    <img
                      alt={product.title}
                      draggable={false}
                      src={selectedImage}
                    />
                    {is360View && canRotate && (
                      <>
                        <button
                          aria-label="Previous product angle"
                          className="detail-rotate-button previous"
                          onClick={() => changeRotation(-1)}
                          onPointerDown={(event) => event.stopPropagation()}
                          type="button"
                        >
                          ‹
                        </button>
                        <button
                          aria-label="Next product angle"
                          className="detail-rotate-button next"
                          onClick={() => changeRotation(1)}
                          onPointerDown={(event) => event.stopPropagation()}
                          type="button"
                        >
                          ›
                        </button>
                        <span aria-live="polite" className="detail-view-status">
                          Drag to rotate · Image {selectedImageIndex + 1} of{" "}
                          {availableImages.length}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div aria-label="Product view" className="detail-view-controls">
                  <button
                    aria-pressed={!is360View}
                    className={!is360View ? "is-active" : ""}
                    onClick={() => setIs360View(false)}
                    type="button"
                  >
                    Photos
                  </button>
                  <button
                    aria-pressed={is360View}
                    className={is360View ? "is-active" : ""}
                    disabled={!canRotate}
                    onClick={() => setIs360View(true)}
                    title={
                      canRotate
                        ? "Rotate through the available product photos"
                        : "360° view requires multiple product photos"
                    }
                    type="button"
                  >
                    360° view
                  </button>
                </div>
                {!canRotate && (
                  <p className="detail-view-hint">
                    360° view is unavailable because this product has only one
                    photo.
                  </p>
                )}
              </section>

              <section className="detail-product-info">
                <p className="detail-store">
                  Visit the {product.brand || product.category} Store
                </p>
                <h1>{product.title}</h1>
                <div className="detail-rating-line">
                  <StarRating rating={product.rating} />
                  <a href="#customer-reviews">
                    {product.reviews?.length ?? 0} customer reviews
                  </a>
                </div>
                <hr />
                {discountPercentage > 0 && (
                  <span className="detail-deal-badge">Limited time deal</span>
                )}
                <div className="detail-price-breakdown">
                  {discountPercentage > 0 && (
                    <span className="detail-discount">
                      -{discountPercentage}%
                    </span>
                  )}
                  <strong>{currency(product.price)}</strong>
                </div>
                {listPrice && (
                  <p className="detail-list-price">
                    M.R.P.: <s>{currency(listPrice)}</s>
                  </p>
                )}
                <p className="detail-tax-note">Inclusive of all taxes</p>
                <div aria-label="Purchase benefits" className="detail-offers">
                  <div>
                    <strong>Free delivery</strong>
                    <span>On eligible orders</span>
                  </div>
                  <div>
                    <strong>Easy returns</strong>
                    <span>See product details</span>
                  </div>
                  <div>
                    <strong>Secure checkout</strong>
                    <span>Shop with confidence</span>
                  </div>
                </div>
                <section className="detail-description">
                  <h2>Product details</h2>
                  <p>{product.description}</p>
                </section>
                <div className="detail-product-meta">
                  <p>
                    <span>Brand</span>
                    <strong>{product.brand || "Independent maker"}</strong>
                  </p>
                  <p>
                    <span>Category</span>
                    <strong>{product.category.replace(/-/g, " ")}</strong>
                  </p>
                </div>
              </section>

              <aside aria-label="Purchase options" className="detail-buy-box">
                <strong className="detail-buy-price">
                  {currency(product.price)}
                </strong>
                <p>
                  <strong>FREE delivery</strong> on eligible orders.
                </p>
                <button
                  className="detail-location-button"
                  onClick={onOpenLocation}
                  type="button"
                >
                  Delivering to {deliveryLocation || "your location"} — Update
                  location
                </button>
                <p className="detail-stock">In stock and ready to ship</p>
                <label htmlFor="detail-quantity">Quantity:</label>
                <select
                  id="detail-quantity"
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  value={quantity}
                >
                  {[1, 2, 3, 4, 5].map((amount) => (
                    <option key={amount} value={amount}>
                      {amount}
                    </option>
                  ))}
                </select>
                <button
                  className="detail-add-button"
                  onClick={() => onAddToCart(product, quantity)}
                  type="button"
                >
                  Add to cart
                </button>
                <div className="detail-buy-meta">
                  <p>
                    <span>Brand</span>
                    <strong>{product.brand || "Independent maker"}</strong>
                  </p>
                  <p>
                    <span>Returns</span>
                    <strong>Easy returns</strong>
                  </p>
                </div>
              </aside>
            </article>

            {product.reviews && product.reviews.length > 0 && (
              <section
                aria-labelledby="customer-reviews-title"
                className="reviews-section detail-reviews"
                id="customer-reviews"
              >
                <div className="reviews-heading">
                  <h2 id="customer-reviews-title">Customer reviews</h2>
                  <span>{product.reviews.length} reviews</span>
                </div>
                {product.reviews.slice(0, 3).map((review, index) => (
                  <article
                    className="review-card"
                    key={`${review.reviewerName}-${index}`}
                  >
                    <div>
                      <strong>{review.reviewerName}</strong>
                      <StarRating rating={review.rating} />
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </section>
            )}
          </>
        ) : null}
      </main>
    </>
  );
}
