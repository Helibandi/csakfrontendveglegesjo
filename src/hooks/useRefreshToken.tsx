import { BASE_URL } from "../utils/backend-conf";
import useAuth from "./UseAuth.ts";
import axios from "axios";
import parseJwt from "../utils/utils"; // make sure this extracts payload from JWT

const useRefreshToken = () => {
  const { auth, setAuth } = useAuth();

  const refresh = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/account/refresh-token`,
        {
          token: auth?.accessToken,
          refreshToken: auth?.refreshToken,
        },
        {
          withCredentials: true,
        }
      );

      const newAccessToken = response.data.token;
      const newRefreshToken = response.data.refreshToken;

      const parsed = parseJwt(newAccessToken); // ⬅️ extract role from token

      const newRole = Array.isArray(parsed?.role)
        ? parsed.role
        : parsed?.role
        ? [parsed.role]
        : [];

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("role", JSON.stringify(newRole)); // optional if you use localStorage

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
