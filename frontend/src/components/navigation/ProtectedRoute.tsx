import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

const isLogin = true; // hardcoded for now

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return isLogin ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
