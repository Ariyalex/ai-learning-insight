import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function PublicRoute({ children }) {
  const { user } = useContext(UserContext);

  // kalau udah login -> lempar ke dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
