import { Link, useLocation } from "react-router-dom";
import { formatPrice } from "../../lib/format";
import type { Product } from "../../types/product";
import StarRating from "./StarRating";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const location = useLocation();

  return (
    <article className={styles.card}>
      <Link
        aria-label={`View ${product.title}`}
        className={styles.link}
        state={{ from: location.pathname + location.search }}
        to={`/product/${product.id}`}
      >
        <div className={styles.imageWrap}>
          <img
            alt={product.title}
            className={styles.image}
            loading="lazy"
            src={product.thumbnail}
          />
        </div>
        <div className={styles.info}>
          <h3 className={styles.title}>{product.title}</h3>
          <StarRating rating={product.rating} />
          <strong className={styles.price}>{formatPrice(product.price)}</strong>
        </div>
      </Link>
    </article>
  );
}
