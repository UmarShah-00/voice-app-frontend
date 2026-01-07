import React, { useRef, useState, useEffect } from "react";

interface Match {
  offset: number;
  length: number;
  replacements: { value: string }[];
}

interface GrammarEditorProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  lang: string; // "en-US" | "ur-PK"
  highlightColor?: string; // default highlight for grammar errors
  highlightWordIndex?: number; // index of the currently spoken word
}

interface MenuState {
  match: Match;
  index: number;
}

const GrammarEditor: React.FC<GrammarEditorProps> = ({
  text,
  setText,
  lang,
  highlightColor = "yellow",
  highlightWordIndex,
}) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const cursorRef = useRef<number | null>(null);

  const isUrdu = lang === "ur-PK";

  /* ---------------- HELPERS ---------------- */
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const saveCursor = () => {
    const sel = window.getSelection();
    if (!sel || !editableRef.current || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(editableRef.current);
    pre.setEnd(range.endContainer, range.endOffset);
    cursorRef.current = pre.toString().length;
  };

  const restoreCursor = (pos: number) => {
    const root = editableRef.current;
    if (!root) return;

    let current = 0;
    const range = document.createRange();
    const sel = window.getSelection();
    if (!sel) return;

    const walk = (node: ChildNode): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.textContent?.length || 0;
        if (current + len >= pos) {
          range.setStart(node, pos - current);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          return true;
        }
        current += len;
      } else {
        for (const child of Array.from(node.childNodes)) {
          if (walk(child)) return true;
        }
      }
      return false;
    };

    walk(root);
  };

  /* ---------------- RENDER TEXT WITH HIGHLIGHTS ---------------- */
  const renderWithHighlights = () => {
    if (!editableRef.current) return;

    let html = "";
    let lastIndex = 0;

    matches.forEach((m, i) => {
      html += escapeHtml(text.slice(lastIndex, m.offset));
      const word = escapeHtml(text.slice(m.offset, m.offset + m.length));

      html += `<span 
        class="cursor-pointer underline decoration-red-500"
        data-idx="${i}"
        style="background-color: ${highlightWordIndex === i ? "orange" : highlightColor};"
      >${word}</span>`;

      lastIndex = m.offset + m.length;
    });

    html += escapeHtml(text.slice(lastIndex));
    editableRef.current.innerHTML = html;

    if (cursorRef.current !== null) {
      restoreCursor(cursorRef.current);
      cursorRef.current = null;
    }
  };

  useEffect(() => {
    renderWithHighlights();
  }, [text, matches, highlightColor, highlightWordIndex]);

  /* ---------------- EVENTS ---------------- */
  const handleInput = () => {
    saveCursor();
    if (editableRef.current) {
      setText(editableRef.current.innerText);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    const idx = el.getAttribute("data-idx");
    if (!idx) return;

    setMenu({
      match: matches[Number(idx)],
      index: Number(idx),
    });
  };

  const handleReplace = (value: string, match: Match) => {
    const before = text.slice(0, match.offset);
    const after = text.slice(match.offset + match.length);
    const newText = before + value + after;

    setText(newText);

    setMatches(
      matches
        .filter((m) => m.offset !== match.offset)
        .map((m) =>
          m.offset > match.offset
            ? { ...m, offset: m.offset - match.length + value.length }
            : m
        )
    );

    cursorRef.current = match.offset + value.length;
    setMenu(null);
  };

  /* ---------------- API ---------------- */
  const checkGrammar = async () => {
    if (!text.trim()) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/voice/api/grammar-check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
      setMatches([]);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="relative w-full mt-4">
      {/* Grammar count badge */}
      {matches.length > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm z-20">
          {matches.length}
        </div>
      )}

      {/* Editable area */}
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onClick={handleClick}
        className="
          w-full min-h-[200px] md:min-h-[250px] 
          p-4 md:p-5
          border rounded-2xl
          focus:outline-none
          overflow-auto
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
        "
        style={{
          whiteSpace: "pre-wrap",
          direction: isUrdu ? "rtl" : "ltr",
          textAlign: isUrdu ? "right" : "left",
        }}
        data-placeholder={isUrdu ? "یہاں اپنا متن لکھیں..." : "Type your text here..."}
      />

      {/* Replacement menu */}
      {menu && menu.match.replacements.length > 0 && (
        <div className="absolute bg-white border shadow rounded mt-1 z-50 w-48 max-w-[90vw] md:w-60">
          {menu.match.replacements.slice(0, 5).map((r, i) => {
            const isSpace = r.value === " ";
            return (
              <div
                key={i}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-200 ${
                  isSpace ? "text-blue-600 font-semibold" : ""
                } truncate`}
                onClick={() => handleReplace(r.value, menu.match)}
              >
                {isSpace ? "␣ Space" : r.value}
              </div>
            );
          })}
        </div>
      )}

      {/* Grammar Test button */}
      {lang === "en-US" && (
        <div className="flex justify-end mt-3">
          <button
            onClick={checkGrammar}
            className="
              px-5 py-2.5
              flex items-center gap-2
              bg-gradient-to-r from-blue-500 to-indigo-600
              text-white font-semibold
              rounded-xl
              transition-all duration-300
              hover:from-blue-600 hover:to-indigo-700
              hover:scale-105
              active:scale-95
              shadow-lg hover:shadow-2xl
            "
          >
            <span className="text-lg">📝</span>
            Grammar Test
          </button>
        </div>
      )}

      {/* Placeholder style */}
      <style>
        {`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
          }
        `}
      </style>
    </div>
  );
};

export default GrammarEditor;
