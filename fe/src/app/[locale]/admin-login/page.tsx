import React from "react";
import Nav from "./Nav";
import LoginForm from "./LoginForm";
import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("auth.login");
  return (
    <>
      <div className="flex bg-gradient-to-r from-black to-[#666666] flex-col items-center flex-1 min-h-screen justify-center">
        <Nav />
        <LoginForm />
        <p className="mt-6">{t("copyright")}</p>
      </div>
    </>
  );
};

export default Page;
