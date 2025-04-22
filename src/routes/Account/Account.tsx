import { useState, useEffect } from 'react';
import { BASE_URL } from '../../utils/backend-conf';
import './Account.css';
import { Orders } from '../../utils/types';
import { User } from '../../utils/types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Account = () => {
  const [activeTab, setActiveTab] = useState('shipping');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Orders[]>([]);
  const [user, setUser] = useState<User>();
  const [editableUser, setEditableUser] = useState<User>();
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const notify = () => toast.success('Operation completed successfully!', { autoClose: 4000 });

  // Load user data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('useralldata');
    if (stored) {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      setEditableUser(parsed); // Initialize editable copy
    }
    setLoading(false);
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const accesstoken = localStorage.getItem('accessToken'); 
        
        const response = await fetch(`${BASE_URL}/api/Orders/my-orders`, {
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
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const mappedOrders = orders.map(order => ({
    id: order.id,
    deliveryAddress: order.deliveryAddress,
    orderDate: order.orderDate,
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      price: item.price,
      product: {
        category: item.product.category,
        description: item.product.description,
        id: item.product.id,
        imageUrl: item.product.imageUrl,
        isAvailable: item.product.isAvailable,
        name: item.product.name,
        price: item.product.price
      },
      productId: item.productId,
      quantity: item.quantity,
      totalPrice: item.totalPrice
    })),
    status: order.status,
    totalAmount: order.totalAmount
  }));

  // Handle input changes for user data
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableUser(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  // Update user data
  const handleDataChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableUser) return;

    try {
      // Transform data to match the API's expected format
      const userData = {
        FirstName: editableUser.FirstName,
        LastName: editableUser.LastName,
        Address: editableUser.Address,
        City: editableUser.City,
        PostalCode: editableUser.PostalCode,
        PhoneNumber: editableUser.PhoneNumber
      };

      const accesstoken = localStorage.getItem('accessToken'); 
      const response = await fetch(`${BASE_URL}/api/account/${editableUser.sub}/edit-user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      // Handle 204 No Content response
      if (response.status === 204) {
        // Update localStorage with the edited user data
        const updatedUserData = {
          ...user,
          FirstName: editableUser.FirstName,
          LastName: editableUser.LastName,
          Address: editableUser.Address, 
          City: editableUser.City,
          PostalCode: editableUser.PostalCode,
          PhoneNumber: editableUser.PhoneNumber
        };
        
        setUser(updatedUserData);
        setEditableUser(updatedUserData);
        localStorage.setItem('useralldata', JSON.stringify(updatedUserData));
        notify();
      } else {
        // If response has content
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditableUser(updatedUser);
        localStorage.setItem('useralldata', JSON.stringify(updatedUser));
        notify();
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      alert('Failed to update user information');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (password.new.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      const passwordData = {
        oldPassword: password.current,
        newPassword: password.new
      };

      const accesstoken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/api/account/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      
      notify();
      setPassword({ current: '', new: '', confirm: '' });
      setPasswordError('');
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="account-page">
      <ToastContainer position="top-right" autoClose={4000} />
      <h1>My Account</h1>
      
      <div className="tabs">
        <button 
          className={activeTab === 'shipping' ? 'active' : ''}
          onClick={() => setActiveTab('shipping')}
        >
          User Info
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          My Orders
        </button>
        <button 
          className={activeTab === 'password' ? 'active' : ''}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
      </div>

      {activeTab === 'shipping' && (
        <div className="tab-content">
          <h2>User Information</h2>
          <form onSubmit={handleDataChange}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="Email"
                value={editableUser?.Email || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input 
                name="FirstName"
                value={editableUser?.FirstName || ''}
                onChange={handleInputChange}
                type="text" 
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input 
                name="LastName"
                value={editableUser?.LastName || ''}
                onChange={handleInputChange}
                type="text" 
                required
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                name="Address"
                value={editableUser?.Address || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input 
                type="text" 
                name="PhoneNumber"
                value={editableUser?.PhoneNumber || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input 
                  type="text" 
                  name="City"
                  value={editableUser?.City || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input 
                  type="text" 
                  name="PostalCode"
                  value={editableUser?.PostalCode || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="save-btn">Save Changes</button>
          </form>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="tab-content">
          <h2>Order History</h2>
          {loading ? (
            <p>Loading orders...</p>
          ) : (
            <div className="orders-list">
              {orders.length === 0 ? (
                <p>No orders found</p>
              ) : (
                mappedOrders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span>Order #{order.id}</span>
                      <span className={`status ${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="order-items">
                      {order.orderItems.map(item => (
                        <div key={item.id} className="order-item">
                          <span>{item.product.name}</span>
                          <span>Qty: {item.quantity}</span>
                          <span>{item.totalPrice}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-details">
                      <span>Date: {new Date(order.orderDate).toLocaleDateString()}</span>
                      <span>Delivery Address: {order.deliveryAddress}</span>
                      <span>Total: {order.totalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'password' && (
        <div className="tab-content">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                value={password.current}
                onChange={(e) => setPassword({...password, current: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={password.new}
                onChange={(e) => setPassword({...password, new: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={password.confirm}
                onChange={(e) => setPassword({...password, confirm: e.target.value})}
                required
              />
            </div>
            {passwordError && <p className="error">{passwordError}</p>}
            <button type="submit" className="save-btn">Update Password</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Account;