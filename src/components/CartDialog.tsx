import type { CartItem } from "../types";
import { currency } from "../utils";

type CartDialogProps = {
  items: CartItem[];
  onClose: () => void;
  onChangeQuantity: (productId: number, amount: number) => void;
  onRemove: (productId: number) => void;
};

export default function CartDialog({
  items,
  onClose,
  onChangeQuantity,
  onRemove,
}: CartDialogProps) {
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="dialog-overlay cart-overlay" onClick={onClose}>
      <section
        aria-labelledby="cart-dialog-title"
        aria-modal="true"
        className="cart-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="dialog-heading">
          <h2 id="cart-dialog-title">Your Cart ({itemCount})</h2>
          <button
            aria-label="Close cart"
            className="dialog-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {items.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-items">
              {items.map(({ product, quantity }) => (
                <li className="cart-item" key={product.id}>
                  <img alt="" src={product.thumbnail} />
                  <div className="cart-item-info">
                    <strong>{product.title}</strong>
                    <span>{currency(product.price)}</span>
                    <div className="cart-item-controls">
                      <button
                        aria-label={`Decrease ${product.title} quantity`}
                        onClick={() => onChangeQuantity(product.id, -1)}
                        type="button"
                      >
                        −
                      </button>
                      <span>{quantity}</span>
                      <button
                        aria-label={`Increase ${product.title} quantity`}
                        onClick={() => onChangeQuantity(product.id, 1)}
                        type="button"
                      >
                        +
                      </button>
                      <button
                        className="cart-remove"
                        onClick={() => onRemove(product.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <strong>{currency(subtotal)}</strong>
            </div>
          </>
        )}
        <div className="dialog-actions">
          <button className="button button-dark" onClick={onClose} type="button">
            Continue shopping
          </button>
        </div>
      </section>
    </div>
  );
}
