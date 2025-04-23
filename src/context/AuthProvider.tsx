import { createContext, useState, useEffect } from "react";
import { AuthConttype } from "../utils/types";
import useRefreshToken from "../hooks/useRefreshToken";

const AuthContext = createContext<AuthConttype>({} as AuthConttype);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState(() => {
    // Parse role properly if it's stored as JSON string
    const accessToken = localStorage.getItem("accessToken") || '';
    const refreshToken = localStorage.getItem("refreshToken") || '';
    const tokenExpiration = localStorage.getItem("tokenExpiration") || '';
    
    let role = '';
    try {
      const storedRole = localStorage.getItem("role");
      if (storedRole) {
        // Try to parse if it's JSON
        if (storedRole.startsWith('[') || storedRole.startsWith('{')) {
          role = JSON.parse(storedRole);
        } else {
          role = storedRole;
        }
      }
    } catch (e) {
      console.error("Error parsing role from localStorage:", e);
      role = '';
    }
    
    return { accessToken, refreshToken, tokenExpiration, role };
  });

  const refresh = useRefreshToken();

  useEffect(() => {
    if (auth?.accessToken) {
      localStorage.setItem("accessToken", auth.accessToken);
      localStorage.setItem("refreshToken", auth.refreshToken);
      localStorage.setItem("tokenExpiration", auth.tokenExpiration || '');
      
      // Store role properly
      if (typeof auth.role === 'object') {
        localStorage.setItem("role", JSON.stringify(auth.role));
      } else {
        localStorage.setItem("role", auth.role || '');
      }
    }
  }, [auth]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (auth?.accessToken && auth?.refreshToken) {
        try {
          await refresh();
        } catch (err) {
          console.error("Error refreshing token:", err);
        }
      } else {
        console.log("Not refreshing - no tokens available");
      }
    }, 25000); // Refresh every 25 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [refresh, auth?.accessToken, auth?.refreshToken]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;