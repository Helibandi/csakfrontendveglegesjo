import useAuth from "./UseAuth";
import { useCart } from "../context/CartContext";

const useLogout = () => {
    const { setAuth } = useAuth();
    const { clearCart } = useCart(); 

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenExpiration");
        localStorage.removeItem("role");
        clearCart();
    };

  return (
    logout
  )
}

export default useLogout
