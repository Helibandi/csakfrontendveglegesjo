import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../utils/backend-conf';
import './MyAccount.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyAccount = () => {
  const { user, setUser } = useAuth();
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phoneNumber: '',
    country: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUserData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        city: user.city,
        postalCode: user.postalCode,
        phoneNumber: user.phoneNumber,
        country: user.country,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const accesstoken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/api/Users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          address: userData.address,
          city: userData.city,
          postalCode: userData.postalCode,
          phoneNumber: userData.phoneNumber,
          country: userData.country,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      localStorage.setItem('useralldata', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      toast.success('Your account information has been updated successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error updating account details:', error);
      
      toast.error('Failed to update your information. Please try again.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add password validation
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("Passwords do not match");
      
      toast.error('Passwords do not match. Please try again.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      const accesstoken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/api/Users/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Reset password fields
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
      setIsChangingPassword(false);
      
      toast.success('Your password has been changed successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError((error as Error).message || 'Failed to change password');
      
      toast.error(`Failed to change password: ${(error as Error).message || 'Please try again.'}`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="account-page">
      <h1>My Account</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={userData.firstName}
            onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={userData.lastName}
            onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label>Address:</label>
          <input
            type="text"
            value={userData.address}
            onChange={(e) => setUserData({ ...userData, address: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label>City:</label>
          <input
            type="text"
            value={userData.city}
            onChange={(e) => setUserData({ ...userData, city: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label>Postal Code:</label>
          <input
            type="text"
            value={userData.postalCode}
            onChange={(e) => setUserData({ ...userData, postalCode: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            value={userData.phoneNumber}
            onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label>Country:</label>
          <input
            type="text"
            value={userData.country}
            onChange={(e) => setUserData({ ...userData, country: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <button type="button" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        {isEditing && <button type="submit">Save</button>}
      </form>

      <h2>Change Password</h2>
      <form onSubmit={handlePasswordSubmit}>
        <div>
          <label>Current Password:</label>
          <input
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            disabled={!isChangingPassword}
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            disabled={!isChangingPassword}
          />
        </div>
        <div>
          <label>Confirm New Password:</label>
          <input
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            disabled={!isChangingPassword}
          />
        </div>
        {passwordError && <p className="error">{passwordError}</p>}
        <button type="button" onClick={() => setIsChangingPassword(!isChangingPassword)}>
          {isChangingPassword ? 'Cancel' : 'Change Password'}
        </button>
        {isChangingPassword && <button type="submit">Save</button>}
      </form>

      <ToastContainer />
    </div>
  );
};

export default MyAccount;