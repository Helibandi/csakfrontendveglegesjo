import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
//import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import './Checkout.css';
import { BASE_URL } from '../../utils/backend-conf';
import { User } from '../../utils/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  //const { isLoggedIn } = useAuth();
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Change default to 'cash'
  const [differentAddress, setDifferentAddress] = useState(false);
  const [alternateFullName, setAlternateFullName] = useState('');
  const [alternateAddress, setAlternateAddress] = useState('');
  const [alternateCity, setAlternateCity] = useState('');
  const [alternateZipCode, setAlternateZipCode] = useState('');
  const [user, setUser] = useState<User>();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('useralldata');
    if (stored) {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      
      // Auto-fill shipping information from user data
      if (parsed.FirstName && parsed.LastName) {
        setFullName(`${parsed.FirstName} ${parsed.LastName}`);
      }
      if (parsed.Address) {
        setAddress(parsed.Address);
      }
      if (parsed.City) {
        setCity(parsed.City);
      }
      if (parsed.PostalCode) {
        setZipCode(parsed.PostalCode);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Use alternate address info if differentAddress is checked
      const addressData = {
        fullName: differentAddress ? alternateFullName : fullName,
        address: differentAddress ? alternateAddress : address,
        city: differentAddress ? alternateCity : city,
        zipCode: differentAddress ? alternateZipCode : zipCode
      };
  
      const requestData = {
        deliveryAddress: JSON.stringify(addressData), 
        cart: {
          items: cart.map(item => ({
            productId: parseInt(item.id), 
            quantity: item.quantity,
            price: item.price
          }))
        }
      };
      
      const accesstoken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/api/Orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      if (!response.ok) {
        throw new Error(`Order failed with status: ${response.status}`);
      }
  
      clearCart();
      navigate('/order-confirmation');
      
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Order submission failed. Please try again.');
    }
  };

  const handleCreditCardClick = () => {
    toast.info('Credit card payments are not currently supported. Please choose another payment method.', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      <div className="checkout-grid">
        {/* Shipping and Payment Form */}
        <form onSubmit={handleSubmit} className="checkout-form">
          <section className="form-section">
            <h2>Shipping Information</h2>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input 
                type="text" 
                id="address" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required 
                placeholder="123 Main St"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input type="text" id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="zip">ZIP Code</label>
                <input type="text" id="zip" required  value={zipCode} onChange={(e) => setZipCode(e.target.value)}/>
              </div>
            </div>
            <label htmlFor="differentAddress" className="checkbox-label">
              <input 
                type="checkbox" 
                id="differentAddress" 
                checked={differentAddress}
                onChange={(e) => setDifferentAddress(e.target.checked)}
              />
              <span>Shipping to a different address?</span>
            </label>

            {differentAddress && (
              <div className="alternate-address">
                <div className="form-group">
                  <label htmlFor="alternateFullName">Full Name</label>
                  <input 
                    type="text" 
                    id="alternateFullName" 
                    required={differentAddress} 
                    value={alternateFullName}
                    onChange={(e) => setAlternateFullName(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="alternateAddress">Address</label>
                  <input 
                    type="text" 
                    id="alternateAddress" 
                    value={alternateAddress}
                    onChange={(e) => setAlternateAddress(e.target.value)}
                    required={differentAddress} 
                    placeholder="123 Main St"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="alternateCity">City</label>
                    <input type="text" id="alternateCity" required={differentAddress} value={alternateCity} onChange={(e) => setAlternateCity(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="alternateZip">ZIP Code</label>
                    <input type="text" id="alternateZip" required={differentAddress}  value={alternateZipCode} onChange={(e) => setAlternateZipCode(e.target.value)}/>
                  </div>
                </div>
              </div>
            )}
            
          </section>

          <section className="form-section">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <label className="payment-option"> 
                <input 
                  type="radio" 
                  name="payment" 
                  value="credit"
                  checked={paymentMethod === 'credit'}
                  onChange={() => handleCreditCardClick()}
                  disabled={true} 
                />
                <span onClick={handleCreditCardClick}>Credit Card</span>
              </label>
            </div>
          </section> 
          
          <section className="form-section">
            <div className="payment-options">
              <label className="payment-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="cash" 
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <span>Cash</span>
              </label>
            </div>
          </section>

          <button type="submit" onClick={handleSubmit} className="place-order-button">
            Place Order - {totalPrice}
          </button>
        </form>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Your Order</h2>
          <div className="order-items">
            {cart.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="item-image"
                  />
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.price} × {item.quantity}</p>
                  </div>
                </div>
                <p className="item-total">
                  {item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>{totalPrice}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>1500</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>{totalPrice + 1500}</span>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Checkout;