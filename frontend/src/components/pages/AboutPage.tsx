import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl tracking-tight font-extrabold text-primary-text sm:text-5xl md:text-5xl">
          {t("about.title")}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-secondary-text sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {t("about.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="bg-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary-text">
                {t("about.mission.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-secondary-text">
              <p>{t("about.mission.description")}</p>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary-text">
                {t("about.howItWorks.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-secondary-text">
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    1
                  </span>
                  {t("about.howItWorks.step1")}
                </p>
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    2
                  </span>
                  {t("about.howItWorks.step2")}
                </p>
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    3
                  </span>
                  {t("about.howItWorks.step3")}
                </p>
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    4
                  </span>
                  {t("about.howItWorks.step4")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary-text">
                {t("about.community.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-secondary-text">
                {t("about.community.description")}
              </p>
              <ul className="space-y-3 text-secondary-text">
                <li className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    ✓
                  </span>
                  {t("about.community.rule1")}
                </li>
                <li className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    ✓
                  </span>
                  {t("about.community.rule2")}
                </li>
                <li className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    ✓
                  </span>
                  {t("about.community.rule3")}
                </li>
                <li className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    ✓
                  </span>
                  {t("about.community.rule4")}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary-text">
                {t("about.contact.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-text">
                {t("about.contact.description")}{" "}
                <a
                  href="mailto:support@inkprov.net"
                  className="text-hover-text hover:text-amber-500 underline"
                >
                  {t("about.contact.email")}
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
