import { FC, useEffect, useState, ElementType } from "react";
import { useAutoTranslate } from "@/utils/translation";

interface TranslatedTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  fallback?: string;
  loadingComponent?: React.ReactNode;
}

export const TranslatedText: FC<TranslatedTextProps> = ({
  text,
  as: Component = "span",
  className = "",
  fallback,
  loadingComponent = null,
}) => {
  const { translateText } = useAutoTranslate();
  const [translatedText, setTranslatedText] = useState<string>(
    fallback || text
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const translate = async () => {
      try {
        setIsLoading(true);
        const result = await translateText(text);
        setTranslatedText(result);
      } catch (error) {
        console.error("Translation error:", error);
        setTranslatedText(fallback || text);
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [text, fallback, translateText]);

  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  return <Component className={className}>{translatedText}</Component>;
};
