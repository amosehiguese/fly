"use client";

import { Button } from "../ui/button";
import { useRouter } from "@/i18n/navigation";
import { AnimatedImage } from "./AnimatedImage";
import { useTranslations } from "next-intl";

export default function AboutUs({
  buttonLink = "/contact",
}: {
  buttonLink?: string;
}) {
  const router = useRouter();
  const t = useTranslations("about");

  return (
    <section className="max-w-[1280px] py-16 px-6 lg:px-16 flex flex-col lg:flex-row gap-8 items-center">
      <div className="w-full flex justify-center lg:block lg:w-1/2">
        <AnimatedImage
          src="/06.jpg"
          alt="Flyttman worker packing boxes"
          width={600}
          height={400}
          borderColor="border-red-500"
        />
      </div>

      <div className="w-full lg:w-1/2">
        <h2 className="text-3xl lg:text-5xl font-extrabold mb-6">
          {t("summary.title")}
        </h2>
        <p className="text-gray-700 font-medium leading-relaxed mb-6">
          {t("summary.content")}
        </p>
        <Button className="bg-red-600 hover:bg-red-700">
          <a
            href="mailto:support@flyttman.se"
            className="hover:text-white/[0.5] transition-colors"
          >
            {t("contactButton")}
          </a>
        </Button>
      </div>
    </section>
  );
}
