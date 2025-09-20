import axios from "axios";
import { useLocale } from "next-intl";

// LibreTranslate API endpoint - you can also self-host or use other instances
const LIBRE_TRANSLATE_API = "https://libretranslate.de/translate";

interface TranslationResponse {
  translatedText: string;
}

// Language detection using Compact Language Detector
const detectLanguage = async (text: string): Promise<string> => {
  try {
    const response = await axios.post("https://libretranslate.de/detect", {
      q: text,
    });
    return response.data[0].language;
  } catch (error) {
    console.error("Language detection error:", error);
    return "en"; // Default to English if detection fails
  }
};

// Convert locale to ISO language code
const normalizeLocale = (locale: string): string => {
  const localeMap: { [key: string]: string } = {
    en: "en",
    sv: "sv",
    // Add more mappings as needed
  };
  return localeMap[locale] || "en";
};

export const translateToLocale = async (
  text: string,
  targetLocale: string
): Promise<string> => {
  try {
    // Normalize target locale
    const normalizedTargetLocale = normalizeLocale(targetLocale);

    // Detect source language
    const sourceLanguage = await detectLanguage(text);

    // If text is already in target language, return as is
    if (sourceLanguage === normalizedTargetLocale) {
      return text;
    }

    // Translate the text
    const response = await axios.post<TranslationResponse>(
      LIBRE_TRANSLATE_API,
      {
        q: text,
        source: sourceLanguage,
        target: normalizedTargetLocale,
      }
    );

    return response.data.translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
};

// React hook for easy use in components
export const useAutoTranslate = () => {
  const locale = useLocale();

  const translateText = async (text: string): Promise<string> => {
    if (!text) return "";
    return await translateToLocale(text, locale);
  };

  // Translate multiple texts at once
  const translateTexts = async (texts: string[]): Promise<string[]> => {
    if (!texts.length) return [];
    return await Promise.all(texts.map((text) => translateText(text)));
  };

  return { translateText, translateTexts };
};

// Example usage in a component:
/*
const MyComponent = () => {
  const { translateText } = useAutoTranslate();
  const [translatedText, setTranslatedText] = useState('');

  useEffect(() => {
    const translate = async () => {
      const result = await translateText('Hello world');
      setTranslatedText(result);
    };
    translate();
  }, []);

  return <div>{translatedText}</div>;
};
*/
