// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useLanguageStore } from "@/store/languageStore";

// // Suppress any type errors for Google Translate API
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// declare global {
//   interface Window {
//     google: any;
//     googleTranslateElementInit: () => void;
//   }
// }

// const TranslationInitializer = () => {
//   const { language, initialized } = useLanguageStore();
//   const scriptRef = useRef<HTMLScriptElement | null>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const [isClient, setIsClient] = useState(false);

//   // Only run this effect on client-side to avoid hydration mismatches
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     // Don't initialize translation until language is detected and we're in the client
//     if (!initialized || !isClient) return;

//     // Set html lang attribute
//     document.documentElement.lang = language;

//     // Initialize Google Translate
//     const initializeTranslation = () => {
//       // Clean up previous instances
//       if (scriptRef.current) {
//         document.head.removeChild(scriptRef.current);
//       }
//       if (containerRef.current) {
//         document.body.removeChild(containerRef.current);
//       }

//       // Remove any existing Google Translate elements
//       const existingElements = document.querySelectorAll(
//         ".skiptranslate, .goog-te-spinner-pos, .goog-te-banner-frame"
//       );
//       existingElements.forEach((el) => el.parentNode?.removeChild(el));

//       // Create new container
//       containerRef.current = document.createElement("div");
//       containerRef.current.id = "google_translate_element";
//       containerRef.current.style.display = "none";
//       document.body.appendChild(containerRef.current);

//       window.googleTranslateElementInit = () => {
//         if (window.google?.translate) {
//           try {
//             new window.google.translate.TranslateElement(
//               {
//                 pageLanguage: "en",
//                 includedLanguages: "en,sv",
//                 autoDisplay: false,
//                 layout:
//                   window.google.translate.TranslateElement.InlineLayout.SIMPLE,
//               },
//               "google_translate_element"
//             );

//             // Force language on initial load
//             const forceLanguage = () => {
//               const select =
//                 document.querySelector<HTMLSelectElement>(".goog-te-combo");
//               if (select) {
//                 select.value = language;
//                 select.dispatchEvent(new Event("change"));
//                 document.body.classList.add("translated");
//               }
//             };

//             const interval = setInterval(() => {
//               if (document.querySelector(".goog-te-combo")) {
//                 forceLanguage();
//                 clearInterval(interval);
//               }
//             }, 100);
//           } catch (error) {
//             console.error("Google Translate initialization error:", error);
//             document.body.classList.add("translated");
//           }
//         }
//       };

//       scriptRef.current = document.createElement("script");
//       scriptRef.current.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&hl=${language}`;
//       scriptRef.current.async = true;
//       scriptRef.current.onerror = () => {
//         document.body.classList.add("translated");
//       };
//       document.head.appendChild(scriptRef.current);
//     };

//     initializeTranslation();

//     return () => {
//       // Cleanup on unmount or language change
//       if (scriptRef.current) {
//         document.head.removeChild(scriptRef.current);
//         scriptRef.current = null;
//       }
//       if (containerRef.current) {
//         document.body.removeChild(containerRef.current);
//         containerRef.current = null;
//       }
//     };
//   }, [language, initialized, isClient]);

//   return null;
// };

// export default TranslationInitializer;
