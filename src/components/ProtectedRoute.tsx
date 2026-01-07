import React from "react";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
interface Props {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // User not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  // User logged in → show children
  return children;
};
