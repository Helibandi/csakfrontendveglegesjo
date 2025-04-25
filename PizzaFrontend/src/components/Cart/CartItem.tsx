import React from "react";
import { CartItem as CartItemType } from "../../utils/types";
import "./CartItem.css";

interface CartItemProps {
  item: CartItemType;
  increaseQuantity: () => void;
  decreaseQuantity: () => void;
  removeItem: () => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
}) => {
  return (
    <div className="cart-item">
      <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>
        <button onClick={removeItem} className="remove-item-btn">
          Remove
        </button>
      </div>
      <div className="cart-item-price-quantity">
        <span className="cart-item-price">{item.price} Ft</span>
        <div className="cart-item-quantity">
          <button onClick={decreaseQuantity} className="quantity-btn">-</button>
          <span>{item.quantity}</span>
          <button onClick={increaseQuantity} className="quantity-btn">+</button>
        </div>
      </div>
      <div className="cart-item-total">
        {(item.price * item.quantity)} Ft
      </div>
    </div>
  );
};

export default CartItem;