import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export function ProtectedRoute({ children, moderatorOnly = false }) {
  const auth = useContext(AuthContext);

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (moderatorOnly && !auth.isModerator) {
    return <Navigate to="/" replace />;
  }

  return children;
}
