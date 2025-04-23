import { BASE_URL } from "../utils/backend-conf";
import useAuth from "./UseAuth.ts";
import axios from "axios";
import parseJwt from "../utils/utils";

// Define the AuthState type to match what's used in the AuthContext
interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  role?: string[];
  isAuthenticated?: boolean;
}

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    // Retrieve tokens from localStorage
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    // Only proceed if we have the required tokens
    if (!storedAccessToken || !storedRefreshToken) {
      console.log("Skipping token refresh - missing tokens");
      return null;
    }

    console.log("Attempting token refresh...");

    // Create the request payload with proper casing to match backend DTO
    const requestPayload = {
      token: storedAccessToken, // Capital T to match RefreshTokenRequestDTO
      refreshToken: storedRefreshToken, // Capital R and T to match RefreshTokenRequestDTO
    };

    // Log the exact request payload for debugging
    console.log("Token refresh request payload:", requestPayload);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/account/refresh-token`,
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ Token refresh successful, received:", response.data);

      // Update property access to match backend response casing (AuthResponseDTO)
      const newAccessToken = response.data.token; // Capital T
      const newRefreshToken = response.data.refreshToken; // Capital R and T

      // Also store expiration time if needed
      const tokenExpiration = response.data.TokenExpiration;
      console.log("Token valid until:", new Date(tokenExpiration));

      // Validate received tokens
      if (!newAccessToken || !newRefreshToken) {
        console.warn(
          "⚠️ Incomplete token data in response - using existing tokens"
        );
        return storedAccessToken; // Return existing token to avoid breaking functionality
      }

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

      // Store the expiration time to help with auto-refresh
      if (tokenExpiration) {
        localStorage.setItem("tokenExpiration", tokenExpiration);
      }

      // Add a check to ensure setAuth is a function before calling it
      setAuth((prev: AuthState) => ({
        ...prev,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        role: newRole,
        isAuthenticated: true, // Ensure authenticated flag is set
      }));

      return newAccessToken;
    } catch (axiosError: any) {
      // If we get a 400 specifically, try an alternate payload format
      if (axiosError.response?.status === 400) {
        console.warn(
          "⚠️ First attempt failed with 400. Trying alternate payload format..."
        );

        try {
          const alternatePayload = {
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
          };

          console.log("Trying alternate payload:", alternatePayload);

          const response = await axios.post(
            `${BASE_URL}/api/account/refresh-token`,
            alternatePayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );

          // If this succeeds, process the response as normal
          console.log("✅ Alternate payload succeeded!");

          // Extract tokens from response
          const newAccessToken =
            response.data.token || response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          // Continue with the rest of the success flow...
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

          if (typeof setAuth === "function") {
            setAuth((prev: AuthState) => ({
              ...prev,
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              role: newRole,
              isAuthenticated: true,
            }));
          }

          return newAccessToken;
        } catch (retryError) {
          console.error("❌ Alternate payload also failed:", retryError);
        }
      }

      // For server errors, log detailed error info
      if (axiosError.response) {
        const status = axiosError.response.status;
        console.error(`Received ${status} error:`, {
          error: axiosError.response.data,
          sentPayload: {
            token: storedAccessToken.substring(0, 20) + "...",
            refreshToken: storedRefreshToken.substring(0, 20) + "...",
          },
        });

        // For server errors, check if they're actually critical
        if (status === 400 || status === 404) {
          // These are common non-critical errors - token may just be expired or malformed
          console.warn(
            `⚠️ Token refresh returned ${status} - may need to re-login soon`
          );
          return storedAccessToken; // Return existing token to continue functionality
        }

        console.error(
          `❌ Token refresh failed with status ${status}:`,
          axiosError.response.data
        );
      } else if (axiosError.request) {
        // Network error - may be temporary
        console.warn(
          "⚠️ Network issue during token refresh - using existing token"
        );
        return storedAccessToken; // Return existing token to continue functionality
      } else {
        return null; // Return null to indicate refresh failure
        // console.error("❌ Token refresh setup error:", axiosError.message);
      }

      // Only clear tokens for truly critical errors (not network errors)
      if (axiosError.response && axiosError.response.status === 401) {
        console.error("🔒 Authentication completely failed - clearing tokens");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }

      return null; // Return null to indicate refresh failure
    }
  };

  return refresh;
};

export default useRefreshToken;
