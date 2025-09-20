"use client";

import React from "react";
import Image from "next/image";
import MovingTipsHeroSection from "@/components/WordPress/MovingTipsHeroSection";
import Footer from "@/components/homepage/Footer";
import { useTranslations } from "next-intl";

export default function MovingTips() {
  const t = useTranslations("movingTips");

  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="relative w-full bg-white-700 flex flex-col items-center ">
        <MovingTipsHeroSection
          className="lg:h-[500px] h-[400px] font-extrabold"
          title={t("title")}
          description=""
          titleTextClassName="text-3xl md:text-5xl leading-relaxed"
        />
        <div className="absolute top-[350px] hidden left-[50%] transform -translate-x-1/2 rounded-lg px-8 md:px-16 md:flex flex-col items-center w-full max-w-[1280px]">
          <Image
            src="/05.jpg"
            alt="Flyttman moving team"
            width={1200}
            height={1000}
            className="lg:w-[70%] w-full h-auto mb-6 rounded-lg"
          />
        </div>
        <div className="rounded-lg mt-24 md:mt-72  px-8 md:px-16 flex flex-col items-center w-full max-w-[1280px]">
          {/* Content Section */}
          <section className="relative md:w-[70%] w-full py-12">
            <div className="mb-10">
              <p className="text-gray-600 mb-6">{t("description")}</p>
            </div>
            {/* 
            <Image
              src="/05.jpg"
              alt="Flyttman moving team"
              width={1200}
              height={1000}
              className="lg:w-[70%] w-full h-auto mb-6 rounded-lg"
            /> */}

            {/* Start Planning Early */}
            <div className="mb-10  ">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.startPlanning.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.startPlanning.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li className="text-gray-600">
                  {t.raw("sections.startPlanning.tips")[0]}
                </li>
              </ul>
            </div>

            {/* Declutter and Organize */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.declutter.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.declutter.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.declutter.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Label Boxes Strategically */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.labelBoxes.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.labelBoxes.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.labelBoxes.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>

              <Image
                src="/03.jpg"
                alt="Flyttman worker moving boxes"
                width={1200}
                height={1000}
                className="w-full h-auto rounded-lg my-8"
              />
            </div>

            {/* Prepare for Moving Day */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.movingDay.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.movingDay.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.movingDay.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Use the Right Moving Tools */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.tools.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.tools.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.tools.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Hire Moving Professionals */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.professionals.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.professionals.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.professionals.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Handle Unexpected Situations */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.unexpected.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.unexpected.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.unexpected.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Pack an "Essentials Box" */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.essentials.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.essentials.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.essentials.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>

              <Image
                src="/04.jpg"
                alt="Flyttman workers loading a truck"
                width={1200}
                height={1000}
                className="w-full h-auto rounded-lg my-8"
              />
            </div>

            {/* Inspect The New Home */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.inspect.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.inspect.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.inspect.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Unpack Strategically */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.unpack.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.unpack.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.unpack.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Create a Home */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.createHome.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.createHome.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.createHome.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Reflect and Celebrate */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                {t("sections.reflect.title")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("sections.reflect.description")}
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {t
                  .raw("sections.reflect.tips")
                  ?.map((item: string, index: number) => (
                    <li key={index.toString()} className="text-gray-600">
                      {item}
                    </li>
                  ))}
              </ul>
              <p className="text-gray-600 mb-6">
                {t("sections.reflect.conclusion")}
              </p>
            </div>

            {/* Comment Section */}
            {/* <div className="border-t pt-10">
              <h2 className="text-2xl font-bold mb-6">{t("comments.title")}</h2>
              <p className="text-gray-600 mb-4">{t("comments.disclaimer")}</p>

              <div className="mb-4">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows={5}
                  placeholder={t("comments.placeholders.comment")}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                  type="text"
                  className="p-3 border border-gray-300 rounded-md"
                  placeholder={t("comments.placeholders.name")}
                />
                <input
                  type="email"
                  className="p-3 border border-gray-300 rounded-md"
                  placeholder={t("comments.placeholders.email")}
                />
                <input
                  type="text"
                  className="p-3 border border-gray-300 rounded-md"
                  placeholder={t("comments.placeholders.website")}
                />
              </div>

              <Button className="bg-red-600 hover:bg-red-700">
                {t("comments.submit")}
              </Button>
            </div> */}
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
