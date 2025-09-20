import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

const GetStarted = () => {
  const t = useTranslations("home.getStarted");

  return (
    <section className="relative bg-[url('/01.jpg')] w-full  max-w-[1280px] bg-cover rounded-[16px] bg-center md:p-12 p-6 before:content-[''] before:absolute before:inset-0 before:bg-black/50 before:rounded-[16px]">
      <div className="relative z-10 md:w-[50%] w-full md:px-0 px-2">
        <h2 className="md:text-[48px]  text-[32px] md:text-left text-white text-center font-bold leading-tight">
          {t("title")}
        </h2>
        <p className="text-white text-[16px]  font-medium md:text-left text-center mt-4">
          {t("description")}
        </p>
      </div>
      <div className="relative z-10 md:justify-start justify-center w-full flex">
        <Link
          href={"/get-quote"}
          className="mt-6 px-6 py-3 text-[#5C5C5B] font-medium bg-[#F4D7D9] shadow-lg rounded-[5px] transition"
          style={{ boxShadow: "5px 5px 0px 0px #00000080" }}
        >
          {t("button")}
        </Link>
      </div>
    </section>
  );
};

export default GetStarted;
