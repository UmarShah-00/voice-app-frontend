export const saveVoiceText = async (text: string, language: string) => {
  if (!text) return;

  try {
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/voice/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language }),
      }
    );
  } catch (error) {
    console.error("Save failed", error);
  }
};
