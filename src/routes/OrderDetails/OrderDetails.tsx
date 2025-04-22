import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/backend-conf';
import { Orders } from '../../utils/types';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Orders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const accesstoken = localStorage.getItem('accessToken'); 
        
        const response = await fetch(`${BASE_URL}/api/Orders/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accesstoken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - Please login again');
          }
          throw new Error(`Failed to fetch order details (Status: ${response.status})`);
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  const updateOrderStatus = async (newStatus: Orders['status']) => {
    if (!order) return;
    
    try {
      setStatusUpdating(true);
      const accesstoken = localStorage.getItem('accessToken'); 
      
      const response = await fetch(`${BASE_URL}/api/Orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Update local state
      setOrder(prev => prev ? {...prev, status: newStatus} : null);
      
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };
  
  // Parse the delivery address (assuming it's stored as a JSON string)
  let deliveryAddress = order?.deliveryAddress || '';
  try {
    const addressObj = JSON.parse(deliveryAddress);
    if (addressObj && typeof addressObj === 'object') {
      deliveryAddress = `${addressObj.fullName}, ${addressObj.address}, ${addressObj.city}, ${addressObj.zipCode}`;
    }
  } catch (e) {
    // Use the address as-is if it's not valid JSON
  }

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/admin')} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="not-found">
        <h2>Order Not Found</h2>
        <p>The requested order could not be found.</p>
        <button onClick={() => navigate('/admin')} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Calculate order totals
  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + item.totalPrice, 0
  );
  const deliveryFee = 1500;
  const total = subtotal + deliveryFee;

  return (
    <div className="order-details-page">
      <div className="order-details-header">
        <button 
          onClick={() => navigate('/admin')}
          className="back-btn"
        >
          ← Back to Dashboard
        </button>
        <h1>Order #{order.id}</h1>
        <div className="order-meta">
          <span>Date: {new Date(order.orderDate).toLocaleString()}</span>
        </div>
      </div>
      
      <div className="order-details-grid">
        <div className="order-info-panel">
          <div className="status-section">
            <h2>Status</h2>
            <div className="status-control">
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(e.target.value as Orders['status'])}
                disabled={statusUpdating}
                className="status-select"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="delivery-section">
            <h2>Delivery Information</h2>
            <p className="delivery-address">{deliveryAddress}</p>
          </div>
          
          <div className="payment-section">
            <h2>Payment Details</h2>
            <p className="payment-method">Method: Cash on Delivery</p>
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(0)}</span>
              </div>
              <div className="total-row">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(0)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>${total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="order-items-panel">
          <h2>Order Items</h2>
          <div className="order-items-list">
            {order.orderItems.map((item) => (
              <div key={item.id} className="order-item-card">
                <div className="item-image-container">
                  <img 
                    src={item.product.imageUrl || '/pizza-placeholder.jpg'}
                    alt={item.product.name}
                    className="item-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('pizza-placeholder.jpg')) {
                        target.src = '/pizza-placeholder.jpg';
                      }
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-description">{item.product.description}</p>
                  <div className="item-meta">
                    <span className="item-price">${item.price.toFixed(0)} × {item.quantity}</span>
                    <span className="item-total">${item.totalPrice.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;