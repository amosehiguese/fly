"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import Image from "next/image";

const Footer = () => {
  const t = useTranslations("footer");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const handleNavigation = (path: string) => {
    router.push(`/${locale}${path}`);
  };

  return (
    <footer className="bg-white pt-12 pb-20 mt-4">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between">
        {/* Logo and Description */}
        <div className="w-full lg:w-1/3 mb-6 lg:mb-0">
          <div className="flex items-center mb-4">
            <Image
              width={100}
              height={100}
              src="/logo.png"
              alt={t("logoAlt")}
              className="h-12 mr-4"
            />
          </div>
          <p className="text-subtitle font-bold text-[20px]">
            {t("description")}
          </p>
        </div>

        {/* Contact Section */}
        <div className="w-full sm:w-1/2 lg:w-1/6 mb-6 sm:mb-0">
          <h3 className="text-subtitle font-bold text-[24px] mb-4">
            {t("contact.title")}
          </h3>
          <ul className="text-subtitle text-[20px] space-y-2">
            <li>{t("contact.address")}</li>
            <li>{t("contact.phone")}</li>
            <li>
              <a
                href={`mailto:${t("contact.email")}`}
                className="text-red-600 hover:underline"
              >
                {t("contact.email")}
              </a>
            </li>
          </ul>
        </div>

        {/* About Us Section */}
        <div className="w-full sm:w-1/2 lg:w-1/6 mb-6 sm:mb-0">
          <h3 className="text-subtitle font-bold text-[24px] mb-4">
            {t("about.title")}
          </h3>
          <ul className="text-subtitle text-[20px] space-y-2">
            {t.raw("about.items").map((item: string, index: number) => (
              <li key={index}>
                <button
                  onClick={() =>
                    handleNavigation(
                      `/${item.toLowerCase().replace(/\s+/g, "-")}`
                    )
                  }
                  className="hover:underline"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Information Section */}
        <div className="w-full sm:w-1/2 lg:w-1/6">
          <h3 className="text-subtitle font-bold text-[24px] mb-4">
            {t("information.title")}
          </h3>
          <ul className="text-subtitle text-[20px] space-y-2">
            {t.raw("information.items").map((item: string, index: number) => (
              <li key={index}>
                <button
                  onClick={() =>
                    handleNavigation(
                      `/${item.toLowerCase().replace(/\s+/g, "-")}`
                    )
                  }
                  className="hover:underline"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="text-[#373737] text-center my-8 text-[20px]">
        {t("copyright")}
      </div>
    </footer>
  );
};

export default Footer;
