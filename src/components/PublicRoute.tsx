import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

export const PublicRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Already logged in → redirect to home or cart
    return <Navigate to="/" replace />;
  }

  // Not logged in → show page
  return children;
};
