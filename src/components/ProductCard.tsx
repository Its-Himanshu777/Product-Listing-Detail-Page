import { Link } from "react-router-dom";
import type { Product } from "../types";
import { currency } from "../utils";
import StarRating from "./StarRating";

type ProductCardProps = {
  product: Product;
  search: string;
  animationDelay: number;
  onAddToCart: (product: Product) => void;
};

export default function ProductCard({
  product,
  search,
  animationDelay,
  onAddToCart,
}: ProductCardProps) {
  const discountPercentage = Math.round(product.discountPercentage ?? 0);
  const listPrice =
    discountPercentage > 0
      ? product.price / (1 - discountPercentage / 100)
      : null;

  return (
    <article
      className="product-card"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <Link
        aria-label={`View ${product.title}`}
        className="product-card-link"
        to={`/product/${product.id}${search}`}
      >
        <div className="product-image-wrap">
          <img alt={product.title} loading="lazy" src={product.thumbnail} />
          {discountPercentage > 0 && (
            <span className="product-badge">-{discountPercentage}% Deal</span>
          )}
        </div>
        <div className="product-info">
          <span className="product-category">
            {(product.brand || "Amazon").toUpperCase()}
          </span>
          <h3>{product.title}</h3>
          <div className="card-rating">
            <StarRating rating={product.rating} />
            <span className="rating-count">
              ({product.reviews?.length ?? 0})
            </span>
          </div>
          <div className="card-price-line">
            <strong>{currency(product.price)}</strong>
            {listPrice !== null && (
              <span className="list-price">
                List: <s>{currency(listPrice)}</s>
              </span>
            )}
          </div>
          <div className="card-delivery">
            <span aria-hidden="true">✓</span> Free delivery
          </div>
        </div>
      </Link>
      <button
        className="card-add-to-cart"
        onClick={() => onAddToCart(product)}
        type="button"
      >
        Add to Cart
      </button>
    </article>
  );
}
