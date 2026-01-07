import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import SavedTexts from './pages/SavedTexts';
import AuthHandler from "./pages/AuthHandler";

// ✅ PublicRoute component
const PublicRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/" replace />; // Logged in → redirect home
  return children;
};

// ✅ ProtectedRoute component
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />; // Not logged in → redirect login
  return children;
};

import { Navigate } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route path="/auth/google/callback" element={<AuthHandler />} />

          {/* Protected routes with Header/Footer */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <div className="flex flex-col flex-grow">
                  <Header />
                  <main className="flex-grow container mx-auto p-4">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/saved" element={<SavedTexts />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
