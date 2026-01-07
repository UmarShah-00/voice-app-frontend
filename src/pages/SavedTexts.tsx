// src/pages/SavedTexts.tsx
import React from "react";
import SavedTextsList from "../components/SavedTextsList";

const SavedTexts: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center pt-10 pb-16 px-4 bg-gradient-to-br from-white to-indigo-50">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 text-center text-gray-800">
        Saved Texts
      </h1>

      <div className="w-full max-w-6xl">
        <SavedTextsList />
      </div>
    </div>
  );
};

export default SavedTexts;
