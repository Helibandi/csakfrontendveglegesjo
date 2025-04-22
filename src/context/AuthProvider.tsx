import { createContext, useState, useEffect } from "react";
import { AuthConttype } from "../utils/types";

const AuthContext = createContext<AuthConttype>({} as AuthConttype);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState(() => {
    const accessToken = localStorage.getItem("accessToken") || '';
    const refreshToken = localStorage.getItem("refreshToken") || '';
    const tokenExpiration = localStorage.getItem("tokenExpiration") || '';
    const role = localStorage.getItem("role") || '';
    return { accessToken, refreshToken, tokenExpiration, role };
  });
  

  useEffect(() => {
    if (auth?.accessToken) {
      localStorage.setItem("accessToken", auth.accessToken);
      localStorage.setItem("refreshToken", auth.refreshToken);
      localStorage.setItem("tokenExpiration", auth.tokenExpiration || '');
      localStorage.setItem("role", auth.role || '');
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
