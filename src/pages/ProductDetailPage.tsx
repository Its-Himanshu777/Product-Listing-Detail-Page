import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/http";
import StarRating from "../components/product/StarRating";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import { useProduct } from "../hooks/useProduct";
import { addRecentlyViewed } from "../hooks/useRecentlyViewed";
import { formatCategoryLabel, formatPrice } from "../lib/format";

export default function ProductDetailPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { product, loading, error, isNotFound, retry } = useProduct(id);
  const [selectedImage, setSelectedImage] = useState<{
    productId: number;
    index: number;
  }>({ productId: -1, index: 0 });

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product]);

  const from = (location.state as { from?: string } | null)?.from;

  function goBack() {
    if (from) {
      navigate(-1);
    } else {
      navigate({ pathname: "/", search: location.search });
    }
  }

  const images = product
    ? product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail]
    : [];
  const activeIndex =
    product && selectedImage.productId === product.id
      ? Math.min(selectedImage.index, images.length - 1)
      : 0;
  const activeImageSrc = images[activeIndex] ?? product?.thumbnail ?? "";

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center">
          <Button onClick={goBack} variant="secondary">
            ← Back
          </Button>
        </div>
        <div
          aria-live="polite"
          className="rounded-[14px] border border-line bg-white p-10 text-center text-muted"
        >
          Loading product details...
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center">
          <Button onClick={goBack} variant="secondary">
            ← Back
          </Button>
        </div>
        <ErrorState
          message="The product you requested does not exist or may have been removed."
          onBack={goBack}
          title="Product not found"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center">
          <Button onClick={goBack} variant="secondary">
            ← Back
          </Button>
        </div>
        <ErrorState
          message={getErrorMessage(error)}
          onBack={goBack}
          onRetry={retry}
          title="We couldn't load this product."
        />
      </div>
    );
  }

  if (!product) return null;

  const reviews = product.reviews ?? [];

  return (
    <article className="rounded-[14px] border border-line bg-white p-5 shadow-[0_2px_8px_rgba(24,48,74,0.05)] md:p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-start md:gap-8">
        <section aria-label="Product images" className="flex flex-col gap-4">
          <div className="flex items-center">
            <Button onClick={goBack} variant="secondary">
              ← Back
            </Button>
          </div>
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[10px] bg-white p-4">
            <img
              alt={product.title}
              className="h-full w-full object-contain"
              src={activeImageSrc}
            />
          </div>
          {images.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              {images.slice(0, 6).map((imageUrl, index) => (
                <button
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={activeIndex === index}
                  className={`h-16 w-16 cursor-pointer rounded-[6px] border-2 bg-surface p-1 ${
                    activeIndex === index ? "border-navy" : "border-transparent"
                  }`}
                  key={`${imageUrl}-${index}`}
                  onClick={() =>
                    setSelectedImage({ productId: product.id, index })
                  }
                  type="button"
                >
                  <img
                    alt=""
                    className="h-full w-full object-contain"
                    src={imageUrl}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 md:border-l md:border-line md:pl-8">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 font-display text-[1.75rem] font-extrabold leading-[1.2] text-ink">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="m-0 font-display text-2xl font-extrabold text-ink">
                {formatPrice(product.price)}
              </p>
              <StarRating rating={product.rating} />
            </div>
          </div>

          <dl className="m-0 flex flex-col gap-1.5 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="font-semibold text-ink">Brand:</dt>
              <dd className="m-0 text-muted">{product.brand || "—"}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="font-semibold text-ink">Category:</dt>
              <dd className="m-0 text-muted">
                {formatCategoryLabel(product.category)}
              </dd>
            </div>
          </dl>

          <hr className="m-0 border-0 border-t border-line" />

          <section aria-labelledby="detail-description-heading">
            <h2
              className="mt-0 mb-2 font-display text-lg font-bold text-ink"
              id="detail-description-heading"
            >
              Description
            </h2>
            <p className="m-0 leading-[1.65] text-ink">{product.description}</p>
          </section>

          {reviews.length > 0 && (
            <>
              <hr className="m-0 border-0 border-t border-line" />
              <section
                aria-labelledby="detail-reviews-heading"
                className="flex flex-col gap-4"
              >
                <h2
                  className="m-0 font-display text-lg font-bold text-ink"
                  id="detail-reviews-heading"
                >
                  Reviews
                </h2>
                <div className="flex flex-col gap-4">
                  {reviews.map((review, index) => (
                    <div
                      className="flex flex-col gap-1.5"
                      key={`${review.reviewerName}-${index}`}
                    >
                      <div className="flex flex-wrap items-center gap-2.5">
                        <strong className="text-sm font-bold text-ink">
                          {review.reviewerName}
                        </strong>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="m-0 text-sm leading-relaxed text-muted">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </article>
  );
}
