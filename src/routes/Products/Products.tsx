import { useEffect, useState } from "react";
import { Product } from "../../utils/types";
import { BASE_URL } from "../../utils/backend-conf";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./Products.css";
import { ToastContainer, toast } from "react-toastify"; // Ensure toast is imported
import "react-toastify/dist/ReactToastify.css";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/Products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Map the products data to match the ProductCard component props
  const mappedProducts = products.map(product => ({
    id: product.id.toString(),
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl || "/images/pizza-placeholder.jpg", // Fix the field name
    description: product.description,
    isAvailable: product.isAvailable, // Include isAvailable property
    category: product.category, // Include category property
  }));

  const handleAddToCart = (productId: string) => {
    // Prevent duplicate notifications
    toast.dismiss();
    toast.success("Product added to cart!");
    // Add your logic for adding the product to the cart here
  };

  if (loading) return <div className="products-loading">Loading products...</div>;
  if (error) return <div className="products-error">{error}</div>;
  if (mappedProducts.length === 0) return <div className="products-empty">No products available</div>;

  return (
    <div className="products-container">
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
      <h1 className="products-title">Our Menu</h1>
      <div className="products-grid">
        {mappedProducts.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            onAddToCart={() => handleAddToCart(product.id)} // Ensure ProductCard handles this prop
          />
        ))}
      </div>
    </div>
  );
}


export default Products;