// src/components/SavedTextsList.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

interface VoiceText {
  _id: string;
  text: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

const SavedTextsList: React.FC = () => {
  const [texts, setTexts] = useState<VoiceText[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTexts();
  }, []);

  // Fetch saved texts from backend
  const fetchTexts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/voice/save`);
      const data = await res.json();
      if (data.success) setTexts(data.data);
    } catch (err) {
      console.error("Failed to fetch texts", err);
    }
  };

  // Toggle "Read More" / "Show Less"
  const toggleReadMore = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Delete text with SweetAlert confirmation
  const deleteText = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the text!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/voice/save/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Deleted!", "Text has been deleted.", "success");
          fetchTexts();
        }
      } catch (err) {
        console.error("Failed to delete text", err);
        Swal.fire("Error", "Failed to delete text", "error");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {texts.map((item, idx) => {
          const isExpanded = expandedIds.has(item._id);
          const displayText =
            isExpanded || item.text.length <= 100
              ? item.text
              : item.text.slice(0, 100) + "...";

          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col justify-between bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <p className="text-gray-700 whitespace-pre-wrap">{displayText}</p>

              {item.text.length > 100 && (
                <button
                  className="mt-3 text-blue-600 font-semibold underline hover:text-blue-800 transition-colors duration-200"
                  onClick={() => toggleReadMore(item._id)}
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </button>
              )}

              <div className="mt-5">
                <button
                  onClick={() => deleteText(item._id)}
                  className="w-full px-4 py-2 rounded-xl font-semibold shadow bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-pink-500 hover:to-red-500 transition-all duration-300"
                >
                  Delete ❌
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SavedTextsList;
