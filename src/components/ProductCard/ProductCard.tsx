// src/components/ProductCard/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.tsx';
import './ProductCard.css';
import { ProductCardProps } from '../../utils/types.ts';
import 'react-toastify/dist/ReactToastify.css';

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
  onAddToCart?: () => void; // Add the onAddToCart prop
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { addToCart } = useCart();

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
          onClick={() => {
            addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
            if (onAddToCart) onAddToCart(); // Handle the onAddToCart event
          }}
          className="add-to-cart-button"
          aria-label={`Add ${product.name} to cart`}
          disabled={!product.isAvailable}
        >
          {product.isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;