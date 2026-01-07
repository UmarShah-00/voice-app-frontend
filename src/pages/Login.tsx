// src/pages/Login.tsx
import React from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

const Login: React.FC = () => {

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50 overflow-hidden px-4">
      {/* Animated Background Circles */}
      <motion.div
        className="absolute w-60 h-60 sm:w-72 sm:h-72 bg-indigo-300 rounded-full top-[-80px] left-[-80px] opacity-30"
        animate={{ x: [0, 200, 0], y: [0, 100, 0] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="absolute w-80 h-80 sm:w-96 sm:h-96 bg-purple-300 rounded-full bottom-[-120px] right-[-120px] opacity-30"
        animate={{ x: [0, -200, 0], y: [0, -100, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
          Welcome Back!
        </h2>
        <p className="mb-4 text-gray-600 text-sm sm:text-base">
          Login quickly with your Google account to start voice typing in multiple languages.
        </p>
        <p className="mb-6 sm:mb-8 text-gray-500 text-xs sm:text-sm">
          Your voice will be converted into text instantly. No email or password required – just sign in with Google!
        </p>

        <motion.button
          onClick={() => {
            // Save intended redirect
            localStorage.setItem("redirectAfterLogin", "/");
           window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-full py-3 sm:py-4 rounded-2xl shadow-lg border border-gray-300 hover:shadow-2xl transition-all duration-300 bg-white"
        >
          <FcGoogle className="text-2xl sm:text-3xl mr-2 sm:mr-3" />
          <span className="font-semibold text-gray-800 text-sm sm:text-base">
            Sign in with Google
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Login;
