import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function Page() {
  const t = await getTranslations("termsConditions.suppliers");

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-8 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-[#365f91] mb-2">
            {t("title")}
          </h1>
          {/* <div className="w-24 h-0.5 bg-blue-600 mx-auto"></div> */}
        </div>

        {/* Document Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          {/* Background Section */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-[#4f81bd]">
              {t("background.title")}
            </h2>
            <div className="space-y-3 text-justify">
              <p>{t("background.paragraph1")}</p>
              <p>{t("background.paragraph2")}</p>
            </div>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-[#4f81bd]">
              {t("section1.title")}
            </h2>
            <div className="space-y-3 text-justify">
              <p>{t("section1.point1")}</p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-[#4f81bd]">
              {t("section2.title")}
            </h2>
            <p className="mb-3 text-justify">{t("section2.intro")}</p>
            <div className="space-y-2 ml-4">
              {(t.raw("section2.services") as string[]).map(
                (service: string, index: number) => (
                  <p key={index} className="text-justify">
                    {service}
                  </p>
                )
              )}
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-[#4f81bd]">
              {t("section3.title")}
            </h2>
            <div className="space-y-3 text-justify">
              <p>{t("section3.point1")}</p>
              <p>{t("section3.point2")}</p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-[#4f81bd]">
              {t("section4.title")}
            </h2>
            <div className="space-y-3 text-justify">
              <p>{t("section4.point1")}</p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-[#4f81bd]">
              {t("section5.title")}
            </h2>
            <div className="space-y-2 ml-4">
              {(t.raw("section5.services") as string[]).map(
                (service: string, index: number) => (
                  <p key={index} className="text-justify">
                    {service}
                  </p>
                )
              )}
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold mb-4 text-[#4f81bd]">
              {t("section6.title")}
            </h2>
            <div className="space-y-2 ml-4">
              {(t.raw("section6.services") as string[]).map(
                (service: string, index: number) => (
                  <p key={index} className="text-justify">
                    {service}
                  </p>
                )
              )}
            </div>
          </section>

          {/* Footer */}
          <section className="mt-12 pt-8 space-y-6">
            <div className="text-center">
              <p className="text-justify font-semibold">
                {t("footer.agreement")}
              </p>
            </div>

            <div className="text-left">
              <p className="text-gray-700">{t("footer.contact")}</p>
            </div>

            {/* Flyttman Logo/Branding */}
            <div className=" mt-12">
              <Image
                src="/logo.png"
                width={250}
                height={100}
                alt="logo"
                className="h-[50px] w-auto"
                priority
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
