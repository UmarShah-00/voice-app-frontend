// src/pages/Home.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

import VoiceControls from "../components/VoiceControls";
import GrammarEditor from "../components/GrammarEditor";
import ActionButtons from "../components/ActionButtons";
import { saveVoiceText } from "../api/voiceApi";

const Home: React.FC = () => {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en-US");

  const handleSave = async () => {
    if (!text.trim()) return;

    try {
      await saveVoiceText(text, lang);
      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Your voice text has been saved successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      setText("");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save text",
      });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-10 overflow-hidden bg-gradient-to-br from-white to-indigo-50">
      {/* Animated Background Shapes */}
      <motion.div
        className="absolute w-72 h-72 bg-indigo-300 rounded-full top-[-100px] left-[-120px] opacity-20"
        animate={{ x: [0, 200, 0], y: [0, 100, 0] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-purple-400 rounded-full bottom-[-150px] right-[-150px] opacity-20"
        animate={{ x: [0, -200, 0], y: [0, -100, 0] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-6xl flex flex-col space-y-6 mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          VoiceFlow Pro
        </h1>
        <p className="text-gray-600 text-center mb-4 text-sm sm:text-base">
          Speak naturally and see your words appear instantly. Supports multiple
          languages!
        </p>

        {/* Voice Input & Language Selector */}
        <VoiceControls setText={setText} setLanguage={setLang} />

        {/* Grammar Editor */}
        <GrammarEditor text={text} setText={setText} lang={lang} />

        {/* Action Buttons: Download TXT/PDF/Word */}
        <ActionButtons text={text} setText={setText} lang={lang} />

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <span>Save</span>
          <span>💾</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Home;
