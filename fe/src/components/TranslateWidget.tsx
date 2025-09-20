"use client";

// components/TranslationWidget.jsx
import { useEffect } from "react";
import Script from "next/script";

// Add type definitions for Google Translate API
declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: {
          new (
            options: {
              pageLanguage: string;
              includedLanguages: string;
              layout: number;
              autoDisplay: boolean;
            },
            element: string
          ): unknown;
          InlineLayout: {
            SIMPLE: number;
          };
        };
      };
    };
    googleTranslateElementInit: () => void;
  }
}

export default function TranslationWidget() {
  useEffect(() => {
    // Define the initialization function that Google's script will call
    window.googleTranslateElementInit = function () {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en", // Original content language is English
            includedLanguages: "en,sv", // Only include English and Swedish
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );

        // Check if we've already translated in this session
        const hasTranslated =
          sessionStorage.getItem("hasTranslated") === "true";

        if (!hasTranslated) {
          // Auto-translate to Swedish after initialization
          // We need to wait a bit for the widget to fully initialize
          setTimeout(() => {
            // Get the select element created by Google Translate
            const selectElement = document.querySelector(
              ".goog-te-combo"
            ) as HTMLSelectElement;
            if (selectElement) {
              // Set it to Swedish (find the Swedish option and select it)
              for (let i = 0; i < selectElement.options.length; i++) {
                if (
                  selectElement.options[i].text.includes("svenska") ||
                  selectElement.options[i].text.includes("Swedish")
                ) {
                  selectElement.selectedIndex = i;
                  // Trigger change event to apply translation
                  const event = new Event("change", { bubbles: true });
                  selectElement.dispatchEvent(event);
                  // Remember we've translated this session
                  sessionStorage.setItem("hasTranslated", "true");
                  break;
                }
              }
            }
          }, 1000);
        }
      }
    };
  }, []);

  return (
    <>
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <div
        id="google_translate_element"
        className="fixed bottom-4 right-4 z-[9999] bg-white p-1 rounded-md shadow-md"
      ></div>
    </>
  );
}
