import { Link, useLocation } from "react-router-dom";
import { formatPrice } from "../../lib/format";
import type { Product } from "../../types/product";
import StarRating from "./StarRating";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const location = useLocation();

  return (
    <article className="rounded-[10px] border border-line bg-white transition duration-150 hover:-translate-y-0.5 hover:border-[#cfd6d1] hover:shadow-[0_8px_24px_rgba(24,48,74,0.08)]">
      <Link
        aria-label={`View ${product.title}`}
        className="flex h-full flex-col rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        state={{ from: location.pathname + location.search }}
        to={`/product/${product.id}`}
      >
        <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-t-[10px] bg-surface p-4">
          <img
            alt={product.title}
            className="h-full w-full object-contain"
            loading="lazy"
            src={product.thumbnail}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="m-0 line-clamp-2 text-base font-semibold leading-[1.35]">
            {product.title}
          </h3>
          <StarRating rating={product.rating} />
          <strong className="mt-auto pt-1 font-display text-lg font-bold text-navy">
            {formatPrice(product.price)}
          </strong>
        </div>
      </Link>
    </article>
  );
}
