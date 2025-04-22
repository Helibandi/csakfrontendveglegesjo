import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/UseAuth.ts";

interface RequireAuthProps {
  allowedRoles: string[]; // Fix: Make this an array
}

const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  console.log("🔒 RequireAuth | auth:", auth);
  console.log("🔒 RequireAuth | allowedRoles:", allowedRoles);
  console.log("🔒 RequireAuth | userRoles:", auth?.role);

  const userRoles = Array.isArray(auth?.role)
    ? auth.role
    : auth?.role
    ? [auth.role]
    : [];

  const isAuthorized = userRoles.some(role => allowedRoles.includes(role));

  return isAuthorized ? (
    <Outlet />
  ) : auth?.accessToken ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
