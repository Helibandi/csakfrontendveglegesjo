import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Home.css';


const dummyPizzas = [
  {
    pizzaId: 1,
    name: 'Margherita',
    description: 'Classic tomato sauce, mozzarella, and basil',
    price: 1990,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    pizzaId: 2,
    name: 'Pepperoni',
    description: 'Tomato sauce, mozzarella, and spicy pepperoni',
    price: 2290,
    imageUrl: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    pizzaId: 3,
    name: 'Vegetarian',
    description: 'Tomato sauce, mozzarella, bell peppers, mushrooms, and olives',
    price: 2190,
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    pizzaId: 4,
    name: 'Hawaiian',
    description: 'Tomato sauce, mozzarella, ham, and pineapple',
    price: 2390,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    pizzaId: 5,
    name: 'BBQ Chicken',
    description: 'BBQ sauce, mozzarella, chicken, and red onions',
    price: 2490,
    imageUrl: 'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    pizzaId: 6,
    name: 'Vegetarian',
    description: 'Tomato sauce, mozzarella, bell peppers, mushrooms, and olives',
    price: 2190,
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    pizzaId: 7,
    name: 'Hawaiian',
    description: 'Tomato sauce, mozzarella, ham, and pineapple',
    price: 2390,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  },
  {
    pizzaId: 8,
    name: 'BBQ Chicken',
    description: 'BBQ sauce, mozzarella, chicken, and red onions',
    price: 2490,
    imageUrl: 'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  }
 
];

const Home = () => {
  const [rotateDeg, setRotateDeg] = useState(-75);
  const [selectedText, setSelectedText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on component mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1500);
    };
    
    checkIsMobile();
    
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Set default pizza if none selected
  useEffect(() => {
    if (!selectedPizza && dummyPizzas.length > 0 && !selectedText) {
      setSelectedPizza(dummyPizzas[0]);
      setSelectedText(dummyPizzas[0].description);
      setSelectedImage(dummyPizzas[0].imageUrl);
    }
  }, []);

  const handleButtonClick = (index) => {
    const angle = -((360 / dummyPizzas.length) * index) - 75;
    setRotateDeg(angle);
    setSelectedText(dummyPizzas[index].description);
    setSelectedImage(dummyPizzas[index].imageUrl);
    setSelectedPizza(dummyPizzas[index]);
  };

  return (
    <div className="home-container">
      <div className="pizza-wheel-background">
        {/* White circle - hide on mobile */}
        {!isMobile && (
          <div className="white-circle"></div>
        )}

        {/* Pizza wheel animation - only on desktop */}
        {!isMobile && (
          <motion.div
            animate={{ rotate: rotateDeg }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
            }}
            className="pizza-wheel"
          >
            {dummyPizzas.map((pizza, index) => (
              <motion.div
                key={pizza.pizzaId}
                className="pizza-wheel-item"
                style={{
                  transform: `translate(-50%, -50%) rotate(${(360 / dummyPizzas.length) * index}deg) translateY(-1000px)`,
                }}
              >
                <motion.img
                  src={pizza.imageUrl}
                  alt={pizza.name}
                  className="pizza-image"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile Layout - Pizza Grid */}
        {isMobile && (
          <div className="mobile-pizza-grid">
            {dummyPizzas.map((pizza, index) => (
              <div 
                key={pizza.pizzaId} 
                className={`mobile-pizza-item ${
                  selectedPizza?.pizzaId === pizza.pizzaId ? 'selected' : ''
                }`}
                onClick={() => handleButtonClick(index)}
              >
                <img 
                  src={pizza.imageUrl} 
                  alt={pizza.name} 
                  className="mobile-pizza-image"
                />
                <span className="mobile-pizza-name">{pizza.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pizza description panel */}
        <div className={`pizza-description-panel ${isMobile ? 'mobile' : ''}`}>
          <h3>{selectedPizza?.name || ''}</h3>
          <p>{selectedText || 'Select a pizza to see its description'}</p>
          {selectedPizza && (
            <div className="pizza-price">
              {selectedPizza.price} Ft
            </div>
          )}
        </div>

        {/* Pizza selection buttons - only on desktop */}
        {!isMobile && (
          <div className="pizza-selection-buttons">
            {dummyPizzas.map((pizza, index) => (
              <button
                key={pizza.pizzaId}
                className="pizza-button"
                onClick={() => handleButtonClick(index)}
              >
                <img 
                  src={pizza.imageUrl} 
                  alt={pizza.name} 
                  className={`pizza-button-image ${
                    selectedImage === pizza.imageUrl ? 'selected' : ''
                  }`}
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