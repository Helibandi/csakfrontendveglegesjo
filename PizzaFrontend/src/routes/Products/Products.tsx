import { useEffect, useState } from "react";
import { Product } from "../../utils/types";
import { BASE_URL } from "../../utils/backend-conf";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./Products.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion"; // Import framer-motion

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/Products`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Map the products data to match the ProductCard component props
  const mappedProducts = products.map((product) => ({
    id: product.id.toString(),
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl || "/images/pizza-placeholder.jpg", // Fix the field name
    description: product.description,
    isAvailable: product.isAvailable, // Include isAvailable property
    category: product.category, // Include category property
  }));

  const handleAddToCart = (productId: string) => {
    const product = mappedProducts.find((p) => p.id === productId);
    if (product) {
      // Let the cart context handle authentication check and toast notifications
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
  };

  if (loading)
    return <div className="products-loading">Loading products...</div>;
  if (error) return <div className="products-error">{error}</div>;
  if (mappedProducts.length === 0)
    return <div className="products-empty">No products available</div>;

  return (
    <motion.div 
      className="products-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
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
      <motion.h1 
        className="products-title"
        variants={titleVariants}
      >
        Our Menu
      </motion.h1>
      <motion.div 
        className="products-grid"
        variants={containerVariants}
      >
        {mappedProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <ProductCard
              product={product}
              onAddToCart={() => handleAddToCart(product.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Products;
