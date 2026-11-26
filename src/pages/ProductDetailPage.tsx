import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/http";
import StarRating from "../components/product/StarRating";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import { useProduct } from "../hooks/useProduct";
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center">
        <Button onClick={goBack} variant="secondary">
          ← Back to results
        </Button>
      </div>

      {loading ? (
        <div
          aria-live="polite"
          className="rounded-[14px] border border-line bg-white p-10 text-center text-muted"
        >
          Loading product details...
        </div>
      ) : isNotFound ? (
        <ErrorState
          message="The product you requested does not exist or may have been removed."
          onBack={goBack}
          title="Product not found"
        />
      ) : error ? (
        <ErrorState
          message={getErrorMessage(error)}
          onBack={goBack}
          onRetry={retry}
          title="We couldn't load this product."
        />
      ) : product ? (
        <article className="grid grid-cols-1 gap-5 rounded-[14px] border border-line bg-white p-4 shadow-[0_2px_8px_rgba(24,48,74,0.05)] md:grid-cols-2 md:gap-8 md:p-6">
          <section aria-label="Product images" className="flex flex-col gap-3">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[10px] bg-surface p-5">
              <img
                alt={product.title}
                className="h-full w-full object-contain"
                src={activeImageSrc}
              />
            </div>
            {images.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {images.slice(0, 6).map((imageUrl, index) => (
                  <button
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={activeIndex === index}
                    className={`h-16 w-16 cursor-pointer rounded-[6px] border-2 bg-surface p-1 ${
                      activeIndex === index
                        ? "border-navy"
                        : "border-transparent"
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

          <section className="flex flex-col gap-4">
            <p className="m-0 text-xs font-bold tracking-[0.06em] text-green uppercase">
              {formatCategoryLabel(product.category)}
            </p>
            <h1 className="m-0 font-display text-[1.75rem] font-extrabold leading-[1.2]">
              {product.title}
            </h1>
            <StarRating rating={product.rating} />
            <p className="m-0 font-display text-[1.75rem] font-extrabold text-navy">
              {formatPrice(product.price)}
            </p>
            <p className="m-0 leading-[1.65] text-ink">{product.description}</p>

            <dl className="mt-2 mb-0 grid grid-cols-2 gap-4 border-t border-line pt-4">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold tracking-[0.05em] text-muted uppercase">
                  Brand
                </dt>
                <dd className="m-0 text-base font-semibold">
                  {product.brand || "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold tracking-[0.05em] text-muted uppercase">
                  Category
                </dt>
                <dd className="m-0 text-base font-semibold">
                  {formatCategoryLabel(product.category)}
                </dd>
              </div>
            </dl>
          </section>
        </article>
      ) : null}
    </div>
  );
}
