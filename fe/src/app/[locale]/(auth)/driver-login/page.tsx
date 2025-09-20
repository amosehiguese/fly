import React from "react";
import DriverLoginForm from "./DriverLoginForm";
import { useTranslations } from "next-intl";

const DriverLoginPage = () => {
  const t = useTranslations("driver.auth");

  return (
    <div className="min-h-screen bg-[url('/1.jpg')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <DriverLoginForm />
        <p className="mt-6 text-white">{t("copyright")}</p>
        <p className="mt-2 text-white">{t("poweredBy")}</p>
      </div>
    </div>
  );
};

export default DriverLoginPage;