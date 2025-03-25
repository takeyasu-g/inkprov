import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LangContext";
import { enUS, ja } from "date-fns/locale";



const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const lastUpdatedDate = format(new Date(2025, 2, 19), lang === "ja" ? "yyyy年M月d日" : "MMMM d yyyy", { locale: lang === "ja" ? ja : enUS }); // year, month, day month starts from 0. January = 0 february = 1 march = 2.

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl tracking-tight font-extrabold text-primary-text sm:text-5xl md:text-5xl">
            {t("privacyPolicy.title")}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-secondary-text sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {lastUpdatedDate}
          </p>
        </div>

            <Textarea
              value={t("privacyPolicy.policy")}
              readOnly
              className="min-h-[600px] font-mono text-sm text-secondary-text bg-white/50 resize-none"
            />
      </div>
    </div>
  );
}

export default PrivacyPage;
