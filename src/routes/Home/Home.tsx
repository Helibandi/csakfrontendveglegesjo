import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./Home.css";
import { BASE_URL } from "../../utils/backend-conf";
import { Product } from "../../utils/types";

const Home = () => {
  const [rotateDeg, setRotateDeg] = useState(-75);
  const [selectedText, setSelectedText] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedPizza, setSelectedPizza] = useState<Product | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [pizzas, setPizzas] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pizzas from the database
  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        setIsLoading(true);

        // Define the IDs we want to fetch (10-17)
        const targetIds = [10, 11, 12, 13, 14, 15, 16, 17];

        // Create promises for all the specific product requests
        const productPromises = targetIds.map(
          (id) =>
            fetch(`${BASE_URL}/api/products/${id}`)
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null) // Return null for any products that fail to fetch
        );

        // Wait for all requests to complete
        const results = await Promise.all(productPromises);

        // Filter out null results (products that couldn't be fetched)
        const selectedPizzas = results.filter((product) => product !== null);

        // If we don't have enough specific products, fetch some extras
        if (selectedPizzas.length < 8) {
          // Fallback - get any available pizzas
          const backupResponse = await fetch(`${BASE_URL}/api/products`);

          if (backupResponse.ok) {
            const allProducts = await backupResponse.json();
            const pizzaProducts = allProducts.filter(
              (product: Product) =>
                product.category === "Pizza" &&
                // Exclude products we already have
                !selectedPizzas.some((p) => p.id === product.id)
            );

            // Add additional pizzas to reach 8 total (if possible)
            const additionalPizzasNeeded = 8 - selectedPizzas.length;
            const additionalPizzas = pizzaProducts.slice(
              0,
              additionalPizzasNeeded
            );

            // Combine specific products with additional products
            selectedPizzas.push(...additionalPizzas);
          }
        }

        // If we don't have any pizzas at all, display an error
        if (selectedPizzas.length === 0) {
          throw new Error("No pizzas found in the database");
        }

        // Format the data to match the expected structure
        const formattedPizzas = selectedPizzas.map((pizza: Product) => ({
          ...pizza,
          pizzaId: parseInt(pizza.id), // Add pizzaId property expected by the component
        }));

        setPizzas(formattedPizzas);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching pizzas:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load pizzas"
        );
        setIsLoading(false);
      }
    };

    fetchPizzas();
  }, []);

  // Check if device is mobile on component mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1500);
    };

    checkIsMobile();

    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Set default pizza if none selected
  useEffect(() => {
    if (!selectedPizza && pizzas.length > 0 && !selectedText) {
      setSelectedPizza(pizzas[0]);
      setSelectedText(pizzas[0].description || "");
      setSelectedImage(pizzas[0].imageUrl || "");
    }
  }, [pizzas, selectedPizza, selectedText]);

  const handleButtonClick = (index: number) => {
    if (pizzas.length === 0) return;

    const angle = -((360 / pizzas.length) * index) - 75;
    setRotateDeg(angle);
    setSelectedText(pizzas[index].description || "");
    setSelectedImage(pizzas[index].imageUrl || "");
    setSelectedPizza(pizzas[index]);
  };

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pizzas...</p>
      </div>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  // Show empty state if no pizzas available
  if (pizzas.length === 0) {
    return (
      <div className="empty-state">
        <p>No pizzas available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="pizza-wheel-background">
        {/* White circle - hide on mobile */}
        {!isMobile && <div className="white-circle"></div>}

        {/* Pizza wheel animation - only on desktop */}
        {!isMobile && (
          <motion.div
            animate={{ rotate: rotateDeg }}
            transition={{
              duration: 1,
              ease: "easeInOut",
            }}
            className="pizza-wheel"
          >
            {pizzas.map((pizza, index) => (
              <motion.div
                key={pizza.id}
                className="pizza-wheel-item"
                style={{
                  transform: `translate(-50%, -50%) rotate(${
                    (360 / pizzas.length) * index
                  }deg) translateY(-1000px)`,
                }}
              >
                <motion.img
                  src={pizza.imageUrl}
                  alt={pizza.name}
                  className="pizza-image"
                  style={{ transform: "rotate(90deg)" }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/pizza-placeholder.jpg"; // Fallback image
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile Layout - Pizza Grid */}
        {isMobile && (
          <div className="mobile-pizza-grid">
            {pizzas.map((pizza, index) => (
              <div
                key={pizza.id}
                className={`mobile-pizza-item ${
                  selectedPizza?.id === pizza.id ? "selected" : ""
                }`}
                onClick={() => handleButtonClick(index)}
              >
                <img
                  src={pizza.imageUrl}
                  alt={pizza.name}
                  className="mobile-pizza-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/pizza-placeholder.jpg"; // Fallback image
                  }}
                />
                <span className="mobile-pizza-name">{pizza.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pizza description panel */}
        <div className={`pizza-description-panel ${isMobile ? "mobile" : ""}`}>
          <h3>{selectedPizza?.name || ""}</h3>
          <p>{selectedText || "Select a pizza to see its description"}</p>
          {selectedPizza && (
            <div className="pizza-price">{selectedPizza.price} Ft</div>
          )}
        </div>

        {/* Pizza selection buttons - only on desktop */}
        {!isMobile && (
          <div className="pizza-selection-buttons">
            {pizzas.map((pizza, index) => (
              <button
                key={pizza.id}
                className="pizza-button"
                onClick={() => handleButtonClick(index)}
              >
                <img
                  src={pizza.imageUrl}
                  alt={pizza.name}
                  className={`pizza-button-image ${
                    selectedImage === pizza.imageUrl ? "selected" : ""
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/pizza-placeholder.jpg"; // Fallback image
                  }}
                />
                <span className="pizza-button-name">{pizza.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
