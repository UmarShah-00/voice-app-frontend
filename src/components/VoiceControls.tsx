import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface VoiceControlsProps {
  setText: React.Dispatch<React.SetStateAction<string>>;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  onStopRecording?: () => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  setText,
  setLanguage,
  onStopRecording,
}) => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lang, setLang] = useState("en-US");

  const recognitionRef = useRef<any>(null);
  const finalTextRef = useRef("");
  const sessionActiveRef = useRef(false);

  /* ---------------- MIC PERMISSION ---------------- */
  const requestMicAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted ✅");
    } catch (err) {
      alert("Microphone access denied. Please allow microphone.");
      console.error(err);
    }
  };

  /* ---------------- INIT RECOGNITION ---------------- */
  const initRecognition = (language: string) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      if (!sessionActiveRef.current) return;

      let interimText = "";
      let finalText = finalTextRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript.trim();

        // Replace common spoken punctuation
        transcript = transcript
          .replace(/\bfull stop\b/gi, ".")
          .replace(/\bcomma\b/gi, ",")
          .replace(/\bquestion mark\b/gi, "?")
          .replace(/\bexclamation mark\b/gi, "!");

        if (event.results[i].isFinal) {
          // Capitalize after full stop
          if (finalText === "" || finalText.endsWith(". ")) {
            transcript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          }
          finalText += transcript + " ";
        } else {
          interimText += transcript + " "; // accumulate interim text
        }
      }

      finalTextRef.current = finalText;
      setText(finalText + interimText);
    };

    recognition.onend = () => {
      if (!sessionActiveRef.current) return;

      if (recording && !paused) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch {}
        }, 500);
      }
    };

    recognition.onerror = (err: any) => {
      console.error("SpeechRecognition error:", err);
      if (recording && !paused) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch {}
        }, 500);
      }
    };

    recognitionRef.current = recognition;
  };

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    initRecognition(lang);
    return () => recognitionRef.current?.stop();
  }, [lang]);

  /* ---------------- CONTROL FUNCTIONS ---------------- */
  const startRecording = async () => {
    sessionActiveRef.current = true;
    setRecording(true);
    setPaused(false);

    try {
      await requestMicAccess();
      recognitionRef.current?.start();
    } catch (err) {
      console.error(err);
    }
  };

  const pauseRecording = () => {
    setPaused(true);
    setRecording(false);
    recognitionRef.current?.stop();
  };

  const resumeRecording = () => {
    setPaused(false);
    setRecording(true);
    try {
      recognitionRef.current?.start();
    } catch {}
  };

  const stopRecording = () => {
    sessionActiveRef.current = false;
    setPaused(false);
    setRecording(false);
    recognitionRef.current?.stop();
    onStopRecording?.();
  };

  const clearText = () => {
    recognitionRef.current?.stop();
    finalTextRef.current = "";
    setText("");
    setRecording(false);
    setPaused(false);
    sessionActiveRef.current = false;
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLang(newLang);
    setLanguage(newLang);
    clearText();
    setTimeout(() => initRecognition(newLang), 200);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col items-center space-y-4">
      <select value={lang} onChange={handleLangChange} className="p-2 border rounded">
        <option value="en-US">English</option>
        <option value="ur-PK">Urdu</option>
      </select>

      <div className="flex items-center space-x-2">
        <span
          className={`w-3 h-3 rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-gray-400"}`}
        />
        <span>{recording ? "Recording..." : "Not recording"}</span>
      </div>

      <div className="flex space-x-4">
        {!recording && !paused && (
          <button onClick={startRecording} className="px-4 py-2 bg-green-500 text-white rounded-lg">
            Start 🎤
          </button>
        )}
        {recording && (
          <button onClick={pauseRecording} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">
            Pause ⏸️
          </button>
        )}
        {paused && (
          <button onClick={resumeRecording} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Resume ▶️
          </button>
        )}
        <button onClick={stopRecording} className="px-4 py-2 bg-red-600 text-white rounded-lg">
          Stop ⏹️
        </button>
        <button onClick={clearText} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
          Clear 🗑️
        </button>
      </div>
    </div>
  );
};

export default VoiceControls;
