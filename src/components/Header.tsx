// src/components/Header.tsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const token = localStorage.getItem("token");

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/saved", label: "Saved" },
  ];

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 md:p-5 shadow-lg rounded-b-2xl relative z-50"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          VoiceFlow Pro
        </h1>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-2xl focus:outline-none"
          >
            {isOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className={`px-3 py-1 rounded-lg font-semibold transition-all duration-300 hover:bg-white hover:text-purple-700 ${
                location.pathname === link.path ? "bg-white text-purple-700" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Sign In / Sign Out Button */}
          {token ? (
            <button
              onClick={handleLogout}
              className="ml-4 px-5 py-2 rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-purple-700 transition-all duration-300"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className={`ml-4 px-5 py-2 rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-purple-700 transition-all duration-300 ${
                location.pathname === "/login" ? "bg-white text-purple-700" : ""
              }`}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-indigo-600 rounded-xl p-4 space-y-2 shadow-lg">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-white hover:text-purple-700 ${
                location.pathname === link.path ? "bg-white text-purple-700" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}

          {token ? (
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="block mt-2 px-5 py-2 rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-purple-700 transition-all duration-300"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block mt-2 px-5 py-2 rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-purple-700 transition-all duration-300"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </motion.header>
  );
};

export default Header;
