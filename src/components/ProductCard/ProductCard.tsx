// src/components/ProductCard/ProductCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";
import { ProductCardProps } from "../../utils/types.ts";
import "react-toastify/dist/ReactToastify.css";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    isAvailable: boolean;
    category: string;
  };
  onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image-container">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
          />
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">
            {product.description?.substring(0, 60)}...
          </p>
        </div>
      </Link>

      <div className="product-footer">
        <span className="product-price">{product.price}</span>
        <button
          onClick={onAddToCart} // Only use the onAddToCart prop, don't call addToCart directly
          className="add-to-cart-button"
          aria-label={`Add ${product.name} to cart`}
          disabled={!product.isAvailable}
        >
          {product.isAvailable ? "Add to Cart" : "Currently Unavailable"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
