import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface ActionButtonsProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  lang: string; // "en-US" | "ur-PK"
}

const chunkText = (text: string, chunkSize = 200) => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({ text, setText, lang }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceRate, setVoiceRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopRequestedRef = useRef(false);

  /* ---------------- PLAY & STOP ---------------- */
  const playText = async () => {
    if (!text.trim()) return;

    stopRequestedRef.current = false;
    setIsPlaying(true);

    if (lang === "ur-PK") {
      const chunks = chunkText(text, 200);
      for (const chunk of chunks) {
        if (stopRequestedRef.current) break;
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/voice/tts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: chunk, lang }),
          });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          await new Promise<void>((resolve) => {
            audio.onended = () => resolve();
            audio.play();
          });
        } catch (err) {
          console.error("Urdu TTS error", err);
          break;
        }
      }
      if (!stopRequestedRef.current) setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = voiceRate;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const words = text.split(/\s+/);
          let charCount = 0;
          for (let i = 0; i < words.length; i++) {
            charCount += words[i].length + 1;
            if (charCount >= event.charIndex) {
              break;
            }
          }
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const stopText = () => {
    stopRequestedRef.current = true;
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    speechSynthesis.cancel();
  };

  /* ---------------- DOWNLOAD FUNCTIONS ---------------- */
  const downloadTXT = () => triggerDownload(new Blob([text], { type: "text/plain" }), "voice-text.txt");

  const downloadPDF = async () => {
    if (!text.trim()) return;

    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.position = "absolute";
    hiddenDiv.style.left = "-9999px";
    hiddenDiv.style.fontFamily = lang === "ur-PK" ? "Jameel Noori Nastaleeq, Arial" : "Times";
    hiddenDiv.style.direction = lang === "ur-PK" ? "rtl" : "ltr";
    hiddenDiv.style.whiteSpace = "pre-wrap";
    hiddenDiv.style.fontSize = "16px";
    hiddenDiv.style.width = "600px";
    hiddenDiv.style.backgroundColor = "transparent";
    hiddenDiv.innerText = text;
    document.body.appendChild(hiddenDiv);

    const canvas = await html2canvas(hiddenDiv, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
    pdf.save("voice-text.pdf");

    document.body.removeChild(hiddenDiv);
  };

  const downloadDOCX = async () => {
    if (!text.trim()) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  font: lang === "ur-PK" ? "Jameel Noori Nastaleeq" : "Arial",
                  rightToLeft: lang === "ur-PK",
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "voice-text.docx");
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4 mt-4 px-2 md:px-0">
      {/* Speed control */}
      {lang === "en-US" && (
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 w-full max-w-xl">
          <label className="flex items-center space-x-2 w-full md:w-auto justify-between">
            <span className="font-semibold">Speed:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceRate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="w-full md:w-40"
            />
            <span>{voiceRate}x</span>
          </label>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl">
        {!isPlaying ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex-1 md:flex-none bg-green-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-green-700 transition-all duration-200"
            onClick={playText}
          >
            Play ▶️
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex-1 md:flex-none bg-red-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-red-700 transition-all duration-200"
            onClick={stopText}
          >
            Stop ⏹️
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex-1 md:flex-none bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow hover:bg-indigo-700 transition-all duration-200"
          onClick={downloadTXT}
        >
          TXT ⬇️
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex-1 md:flex-none bg-purple-600 text-white px-5 py-3 rounded-2xl shadow hover:bg-purple-700 transition-all duration-200"
          onClick={downloadPDF}
        >
          PDF ⬇️
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex-1 md:flex-none bg-blue-600 text-white px-5 py-3 rounded-2xl shadow hover:bg-blue-700 transition-all duration-200"
          onClick={downloadDOCX}
        >
          Word ⬇️
        </motion.button>
      </div>
    </div>
  );
};

export default ActionButtons;
