// src/components/CartDisplay/CartDisplay.tsx
import { useCart } from '../../context/CartContext';
import './CartDisplay.css';

const CartDisplay = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart 
  } = useCart();

  if (cart.length === 0) {
    return <div className="empty-cart">Your cart is empty</div>;
  }

  return (
    <div className="cart-container">
      <h2>Your Cart ({totalItems} items)</h2>
      
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="cart-item-image"
            />
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p>{item.price} each</p>
              
              <div className="quantity-controls">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              
              <p className="item-total">
                Total: {(item.price * item.quantity)}
              </p>
              
              <button 
                onClick={() => removeFromCart(item.id)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <h3>Order Total: {totalPrice}</h3>
        <button 
          onClick={clearCart}
          className="clear-cart-button"
        >
          Clear Cart
        </button>
        <button 
          className="checkout-button"
          onClick={() => window.location.href = '/checkout'}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartDisplay;