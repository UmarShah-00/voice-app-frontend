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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTexts();
  }, []);

  // Fetch saved texts
  const fetchTexts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/voice/save`
      );
      const data = await res.json();
      if (data.success) setTexts(data.data);
    } catch (err) {
      console.error("Failed to fetch texts", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadMore = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

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
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/voice/save/${id}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (data.success) {
          Swal.fire("Deleted!", "Text has been deleted.", "success");
          fetchTexts();
        }
      } catch (err) {
        Swal.fire("Error", "Failed to delete text", "error");
      }
    }
  };

  // 🔹 Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg font-semibold text-gray-500">
        Loading...
      </div>
    );
  }

  // 🔹 No Records Found
  if (!loading && texts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col justify-center items-center h-64 text-center"
      >
        <p className="text-2xl font-bold text-gray-600">
          No Records Found 📭
        </p>
        <p className="text-gray-500 mt-2">
          You haven’t saved any voice text yet.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
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
              <p className="text-gray-700 whitespace-pre-wrap">
                {displayText}
              </p>

              {item.text.length > 100 && (
                <button
                  className="mt-3 text-blue-600 font-semibold underline"
                  onClick={() => toggleReadMore(item._id)}
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </button>
              )}

              <button
                onClick={() => deleteText(item._id)}
                className="mt-5 w-full px-4 py-2 rounded-xl font-semibold shadow bg-gradient-to-r from-red-500 to-pink-500 text-white"
              >
                Delete ❌
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SavedTextsList;
