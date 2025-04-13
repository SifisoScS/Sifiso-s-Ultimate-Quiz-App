// frontend/components/ui/text-to-speech.jsx
import React from "react";
import { Button } from "./button";
import { Volume2 } from "lucide-react";

export default function TextToSpeech({ text }) {
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      variant="outline"
      className="bg-teal-500 hover:bg-teal-600 text-white"
      onClick={speak}
    >
      <Volume2 className="h-4 w-4 mr-2" /> Read Aloud
    </Button>
  );
}