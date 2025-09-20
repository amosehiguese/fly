import { create } from "zustand";
import { persist } from "zustand/middleware";

type LanguageState = {
  language: "en" | "sv";
  initialized: boolean;
  setLanguage: (language: "en" | "sv") => void;
  initialize: () => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en", // Default fallback
      initialized: false,
      setLanguage: (language) => set({ language }),
      initialize: () => {
        // Only run on client-side
        if (
          typeof window !== "undefined" &&
          !localStorage.getItem("language-storage")
        ) {
          const browserLang =
            navigator.language || navigator.languages?.[0] || "en";
          const detectedLang = browserLang.startsWith("sv") ? "sv" : "en";
          set({ language: detectedLang, initialized: true });
        } else {
          set({ initialized: true });
        }
      },
    }),
    {
      name: "language-storage",
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => state?.initialize(),
    }
  )
);
