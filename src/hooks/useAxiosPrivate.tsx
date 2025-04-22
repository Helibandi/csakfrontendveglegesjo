import { useEffect } from 'react';
import { axiosPrivate } from '../api/api';
import useAuth from './UseAuth';
import useRefreshToken from './useRefreshToken';
import { AxiosRequestConfig, AxiosError } from 'axios';

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        if (!config.headers) {
          config.headers = {};
        }
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const prevRequest = error?.config as AxiosRequestConfig & { sent?: boolean };

        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await refresh();
          if (prevRequest.headers) {
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          return axiosPrivate(prevRequest);
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
