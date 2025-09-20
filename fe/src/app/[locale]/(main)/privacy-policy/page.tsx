import React from "react";
import { useTranslations } from "next-intl";

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacyPolicy");

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-gray-600 mb-6">{t("lastUpdated")}</p>

        <div className="mb-8">
          <p className="mb-4">{t("introduction")}</p>
          <ul className="list-none pl-0">
            {[0, 1, 2, 3].map((index) => (
              <li key={index} className="py-1">
                • {t(`introductionPoints.${index}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t("consent.title")}</h2>
          <p>{t("consent.content")}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t("collect.title")}</h2>
          <p className="mb-2">{t("collect.content")}</p>
          <ul className="list-none pl-0">
            {[0, 1, 2, 3].map((index) => (
              <li key={index} className="py-1">
                • {t(`collect.points.${index}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t("usage.title")}</h2>
          <p className="mb-2">{t("usage.content")}</p>
          <ul className="list-none pl-0">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <li key={index} className="py-1">
                • {t(`usage.points.${index}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t("sharing.title")}</h2>
          <p className="mb-2">{t("sharing.content")}</p>
          <ul className="list-none pl-0">
            {[0, 1, 2, 3].map((index) => (
              <li key={index} className="py-1">
                • {t(`sharing.points.${index}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t("cookies.title")}</h2>
          <p>{t("cookies.content")}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t("security.title")}</h2>
          <p className="mb-2">{t("security.content")}</p>
          <p>{t("security.additional")}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t("changes.title")}</h2>
          <p>{t("changes.content")}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">{t("contact.title")}</h2>
          <p className="mb-2">{t("contact.content")}</p>
          <p className="mb-2">{t("contact.email")}</p>
          <p>{t("contact.website")}</p>
        </div>
      </div>
    </div>
  );
}
