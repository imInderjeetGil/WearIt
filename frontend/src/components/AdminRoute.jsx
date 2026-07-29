import { Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    toast.error("Please login.");
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    toast.error("Admin access required.");
    return <Navigate to="/" replace />;
  }

  return children;
}