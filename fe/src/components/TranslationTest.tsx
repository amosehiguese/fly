"use client";

import { useLanguageStore } from "@/store/languageStore";

export default function TranslationTest() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="fixed left-4 bottom-4 p-4 bg-white shadow-lg rounded-lg z-[9000] text-sm">
      <h3 className="font-bold mb-2">Translation Test</h3>
      <div className="space-y-2">
        <p>Current language: {language}</p>
        <div className="flex space-x-2">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded ${
              language === "en" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("sv")}
            className={`px-3 py-1 rounded ${
              language === "sv" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Swedish
          </button>
        </div>

        <div className="mt-3 p-2 border border-gray-300 rounded">
          <p>These text blocks should translate:</p>
          <p className="mt-2 font-bold">Hello, welcome to our website!</p>
          <p className="mt-1">This is a test of the translation system.</p>
          <p className="mt-1">
            Please click on the Swedish button to see the translation in action.
          </p>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          <p>Debug info:</p>
          <p>
            Google loaded:{" "}
            {typeof window !== "undefined" && window.google ? "Yes" : "No"}
          </p>
          <p>
            Translate element:{" "}
            {typeof document !== "undefined" &&
            document.getElementById("google_translate_element")
              ? "Found"
              : "Not found"}
          </p>
        </div>
      </div>
    </div>
  );
}
