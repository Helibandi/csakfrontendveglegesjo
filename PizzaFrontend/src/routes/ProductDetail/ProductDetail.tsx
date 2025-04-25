import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/backend-conf";
import { useCart } from "../../context/CartContext";
import "./ProductDetail.css";
import { Product } from "../../utils/types";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/Products/${id}`);

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError("Failed to load product details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        },
        quantity // Pass the quantity directly
      );

      // Remove the duplicate toast notification - CartContext already handles this
    }
  };

  if (loading)
    return (
      <div className="product-detail-loading">Loading product details...</div>
    );
  if (error) return <div className="product-detail-error">{error}</div>;
  if (!product)
    return <div className="product-detail-error">Product not found</div>;

  return (
    <div className="product-detail-container">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="product-detail-card">
        <div className="product-detail-image-container">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-detail-image"
          />
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>

          <div className="product-detail-meta">
            <span className="product-detail-availability">
              {product.isAvailable ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-price-container">
            <span className="product-detail-price">
              {product.price} Ft
            </span>

            <div className="product-detail-quantity">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="quantity-button"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="quantity-button"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="product-detail-add-button"
            disabled={!product.isAvailable}
          >
            {product.isAvailable ? "Add to Cart" : "Currently Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
