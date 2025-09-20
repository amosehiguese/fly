"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/languageStore";

export default function LanguageDetector() {
  const { initialized, initialize } = useLanguageStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  return null; // No UI - just detection logic
}
