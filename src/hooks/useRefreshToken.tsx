import { BASE_URL } from "../utils/backend-conf";
import useAuth from "./UseAuth.ts";
import axios from "axios";
import parseJwt from "../utils/utils";

const useRefreshToken = () => {
  const { auth, setAuth } = useAuth();

  const refresh = async () => {
    try {
      // Retrieve tokens from localStorage
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      // Only proceed if we have the required tokens
      if (!storedAccessToken || !storedRefreshToken) {
        console.log("Skipping token refresh - missing tokens");
        return null;
      }

      console.log("Refreshing with tokens:", {
        accessToken: storedAccessToken.substring(0, 10) + "...",
        refreshToken: storedRefreshToken.substring(0, 10) + "..."
      });

      const response = await axios.post(
        `${BASE_URL}/api/account/refresh-token`,
        {
          token: storedAccessToken,
          refreshToken: storedRefreshToken,
        },
        {
          withCredentials: true,
        }
      );

      const newAccessToken = response.data.token;
      const newRefreshToken = response.data.refreshToken;

      const parsed = parseJwt(newAccessToken);

      const newRole = Array.isArray(parsed?.role)
        ? parsed.role
        : parsed?.role
        ? [parsed.role]
        : [];

      // Update tokens in localStorage
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("role", JSON.stringify(newRole));

      setAuth(prev => ({
        ...prev,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        role: newRole,
      }));

      return newAccessToken;
    } catch (err) {
      console.error("❌ Token refresh failed:", err);
      throw err;
    }
  };

  return refresh;
};

export default useRefreshToken;