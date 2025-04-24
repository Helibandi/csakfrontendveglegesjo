import { useState, useEffect } from 'react';
import { User } from '../utils/types';

/**
 * Custom hook to access and manage user data across the application
 */
export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const loadUserData = () => {
      setLoading(true);
      const stored = localStorage.getItem("useralldata");
      
      if (stored) {
        try {
          const parsed: User = JSON.parse(stored);
          setUser(parsed);
        } catch (err) {
          console.error("Error parsing user data from localStorage:", err);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    loadUserData();
  }, []);

  // Function to update user data (both state and localStorage)
  const updateUserData = (newUserData: User) => {
    setUser(newUserData);
    localStorage.setItem("useralldata", JSON.stringify(newUserData));
  };

  // Get user email with proper error handling
  const getUserEmail = (): string => {
    if (user && user.Email) {
      return user.Email;
    }
    
    // Try getting from other sources if user object doesn't have email
    const userDataStr = localStorage.getItem("useralldata");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.Email) {
          return userData.Email;
        }
      } catch (e) {
        console.log("Could not parse user data from localStorage");
      }
    }
    
    return "";
  };
  
  return { user, loading, updateUserData, getUserEmail };
};

export default useUserData;
