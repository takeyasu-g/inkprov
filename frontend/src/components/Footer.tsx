import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="flex justify-end bottom-0 left-0 w-full bg-white z-50 p-4 border-t border-t-gray-300">
      {/* Side Links */}
      <div className="flex gap-4 items-center text-primary-text mr-6">
        <a href="/about" className="text-md hover:text-hover-text">
          {t("footer.about")}
        </a>
        <a href="/privacy" className="text-md hover:text-hover-text">
          {t("footer.privacy")}
        </a>
        <a href="/terms" className="text-md hover:text-hover-text">
          {t("footer.terms")}
        </a>
        <a href="/contact" className="text-md hover:text-hover-text">
          {t("footer.contact")}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
