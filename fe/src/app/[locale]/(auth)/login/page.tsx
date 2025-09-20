import LoginForm from "./LoginForm";
import React from "react";
import Nav from "./Nav";
import { useTranslations } from "next-intl";

const LoginPage = () => {
  const t = useTranslations("auth.login");

  return (
    <div className="h-screen">
      <Nav />
      <div className="flex flex-col items-center h-full flex-1 overflow-y-hidden bg-[url('/1.jpg')] bg-cover bg-no-repeat bg-center justify-center">
        <LoginForm />
        <p className="mt-6">{t("copyright")}</p>
        <p className="mt-2">{t("poweredBy")}</p>
      </div>
    </div>
  );
};

export default LoginPage;
