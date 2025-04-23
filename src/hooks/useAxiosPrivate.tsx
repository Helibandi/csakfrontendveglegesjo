import { useEffect } from "react";
import { axiosPrivate } from "../api/api";
import useAuth from "./UseAuth";
import useRefreshToken from "./useRefreshToken";
import { AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from "axios";

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!config.headers) {
          // Create proper headers object
          config.headers = new AxiosHeaders();
        }
        if (!config.headers["Authorization"]) {
          config.headers.set("Authorization", `Bearer ${auth?.accessToken}`);
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const prevRequest = error?.config as InternalAxiosRequestConfig & {
          sent?: boolean;
        };

        // Check if error is due to expired token (401 status) or contains specific error message
        const isExpiredToken =
          error?.response?.status === 401 ||
          (error?.response?.data as any)?.message
            ?.toLowerCase()
            ?.includes("expired");

        if (isExpiredToken && !prevRequest?.sent) {
          console.log("Token appears to be expired, attempting refresh");
          prevRequest.sent = true;

          try {
            const newAccessToken = await refresh();
            if (prevRequest.headers) {
              prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            }
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            console.error(
              "Failed to refresh token during request:",
              refreshError
            );
            // Possibly redirect to login here
            throw error;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth?.accessToken, refresh]);

  return axiosPrivate;
};

export default useAxiosPrivate;
