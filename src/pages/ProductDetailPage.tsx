import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/http";
import StarRating from "../components/product/StarRating";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import { useProduct } from "../hooks/useProduct";
import { formatCategoryLabel, formatPrice } from "../lib/format";
import styles from "./ProductDetailPage.module.css";

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
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Button onClick={goBack} variant="secondary">
          ← Back to results
        </Button>
      </div>

      {loading ? (
        <div aria-live="polite" className={styles.loadingCard}>
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
        <article className={styles.detailGrid}>
          <section aria-label="Product images" className={styles.gallery}>
            <div className={styles.mainImageWrap}>
              <img
                alt={product.title}
                className={styles.mainImage}
                src={activeImageSrc}
              />
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.slice(0, 6).map((imageUrl, index) => (
                  <button
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={activeIndex === index}
                    className={`${styles.thumbButton} ${
                      activeIndex === index ? styles.thumbSelected : ""
                    }`}
                    key={`${imageUrl}-${index}`}
                    onClick={() =>
                      setSelectedImage({ productId: product.id, index })
                    }
                    type="button"
                  >
                    <img alt="" className={styles.thumbImage} src={imageUrl} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles.info}>
            <p className={styles.categoryTag}>
              {formatCategoryLabel(product.category)}
            </p>
            <h1 className={styles.title}>{product.title}</h1>
            <StarRating rating={product.rating} />
            <p className={styles.price}>{formatPrice(product.price)}</p>
            <p className={styles.description}>{product.description}</p>

            <dl className={styles.meta}>
              <div className={styles.metaRow}>
                <dt>Brand</dt>
                <dd>{product.brand || "—"}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt>Category</dt>
                <dd>{formatCategoryLabel(product.category)}</dd>
              </div>
            </dl>
          </section>
        </article>
      ) : null}
    </div>
  );
}
