import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useContext,
  } from "react";
  import i18n from "i18next";
  import { initReactI18next } from "react-i18next";
  import LanguageDetector from "i18next-browser-languagedetector";
  import en from "../locales/en.json";
  import ja from "../locales/ja.json";
  
  // Initialize i18next with language detection
  i18n
  .use(LanguageDetector)
  .use(initReactI18next).init({
    supportedLngs: ["en", "ja"],  
    fallbackLng: getSessionLang(),
    resources: {
      en: {
        translation: en,
      },
      ja: {
        translation: ja,
      },
    },
  });
  
  // Get user's selected language from session storage
  function getSessionLang(): string {
    const lang = sessionStorage.getItem("lang");
    return lang || "ja";
  }
  
  interface LanguageContextType {
    lang: string;
    setLang: (lang: string) => void;
  }
  
  interface LanguageProviderProps {
    children: ReactNode;
  }
  
  // Create LanguageContext
  const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
  );
  
  // Export Language Context functionality and values
  export const LanguageProvider: React.FC<LanguageProviderProps> = ({
    children,
  }) => {
    const [lang, setLang] = useState<string>(getSessionLang());
  
    // Update selected language
    useEffect(() => {
      i18n.changeLanguage(lang);
      sessionStorage.setItem("lang", lang);
    }, [lang]);
  
    // reuturn LanguageProvider to allow all components that are children to accces the values from LanguageContext
    return (
      <LanguageContext.Provider value={{ lang, setLang }}>
        {children}
      </LanguageContext.Provider>
    );
  };
  
  // Allow components to access the values from LanguageContext
  export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
      throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
  };
  
  export default i18n;
