// // src/components/TranslationsProvider.tsx
// "use client";

// import { createInstance } from "i18next";
// import { I18nextProvider } from "react-i18next";
// import { ReactNode, useEffect, useState } from "react";
// import initTranslations from "@/i18n"; // Using the init function we defined earlier

// export default function TranslationsProvider({
//   children,
//   locale,
//   namespaces,
//   resources,
// }: {
//   children: ReactNode;
//   locale: string;
//   namespaces: string[];
//   resources: any; // Type appropriately if possible, often Record<string, any>
// }) {
//   const [i18n, setI18n] = useState(createInstance());

//   useEffect(() => {
//     const init = async () => {
//       const instance = createInstance();
//       await initTranslations(locale, namespaces, instance, resources);
//       setI18n(instance);
//     };
//     init();
//   }, [locale, namespaces, resources]);

//   // Prevent rendering until i18n is initialized
//   if (!i18n.isInitialized) {
//     // You might want a loading state here instead of null
//     return null;
//   }

//   return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
// }
