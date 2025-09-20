"use client";

import React from "react";
import Link from "next/link";
import Nav from "@/components/homepage/Nav";
import Footer from "@/components/homepage/Footer";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

const cityList = {
  column1: [
    { label: "Stockholm", value: "stockholm" },
    { label: "Göteborg", value: "goteborg" },
    { label: "Malmö", value: "malmo" },
    { label: "Norrland", value: "norrland" },
    { label: "Uppsala", value: "uppsala" },
    { label: "Västerås", value: "vasteras" },
    { label: "Örebro", value: "orebro" },
    { label: "Linköping", value: "linkoping" },
    { label: "Helsingborg", value: "helsingborg" },
    { label: "Jönköping", value: "jonkoping" },
    { label: "Norrköping", value: "norrkoping" },
  ],
  column2: [
    { label: "Lund", value: "lund" },
    { label: "Umeå", value: "umea" },
    { label: "Gävle", value: "gavle" },
    { label: "Borås", value: "boras" },
    { label: "Södertälje", value: "sodertalje" },
    { label: "Eskilstuna", value: "eskilstuna" },
    { label: "Halmstad", value: "halmstad" },
    { label: "Växjö", value: "vaxjo" },
    { label: "Karlstad", value: "karlstad" },
    { label: "Luleå", value: "lulea" },
    { label: "Sundsvall", value: "sundsvall" },
  ],
  column3: [
    { label: "Trollhättan", value: "trollhattan" },
    { label: "Östersund", value: "ostersund" },
    { label: "Borlänge", value: "borlange" },
    { label: "Upplands Väsby", value: "upplands-vasby" },
    { label: "Falun", value: "falun" },
    { label: "Tumba", value: "tumba" },
    { label: "Kalmar", value: "kalmar" },
    { label: "Kristianstad", value: "kristianstad" },
    { label: "Karlskrona", value: "karlskrona" },
    { label: "Nyköping", value: "nykoping" },
  ],
};

export default function Cities() {
  const t = useTranslations("cities");

  // const locale = useLocale();
  const pathname = usePathname();
  console.log("pathname", pathname);

  // if (locale === "en" && pathname === "stader") return redirect("/cities");

  return (
    <main className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full bg-[url('/pink-hero-bg.png')] bg-cover bg-center items-center flex flex-col py-4 min-h-screen">
        <Nav />

        <div className="max-w-[1280px] px-16 mt-12 py-12 text-center">
          <h1 className="text-4xl md:text-7xl font-extrabold text-gray-800 mt-4 mb-8 font-urbanist">
            {t("title")}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:w-[700px] gap-8 max-w-[1280px] w-[80%] px-16 mb-16">
          <div className="flex flex-col space-y-4">
            {cityList.column1.map((city) => (
              <CityLink
                key={city.value}
                value={city.value}
                label={city.label}
              />
            ))}
          </div>
          <div className="flex flex-col space-y-4">
            {cityList.column2.map((city) => (
              <CityLink
                key={city.value}
                value={city.value}
                label={city.label}
              />
            ))}
          </div>
          <div className="flex flex-col space-y-4">
            {cityList.column3.map((city) => (
              <CityLink
                key={city.value}
                value={city.value}
                label={city.label}
              />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

// Component for city links with arrow icon
function CityLink({ value, label }: { value: string; label: string }) {
  const locale = useLocale();
  const linkPath = locale === "en" ? "cities" : "stader";

  return (
    <Link
      href={`${linkPath}/${value}`}
      className="flex items-center text-gray-800 hover:text-red-600 transition-colors"
    >
      <span className="text-red-600 mr-2">»</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
