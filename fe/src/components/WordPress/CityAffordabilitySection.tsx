import { formatToSentenceCase } from "@/lib/formatToSentenceCase";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CityAffordabilitySection = ({ t }: { t: any }) => {
  return (
    <section className="bg-pink-50 py-12 px-6 md:px-16 w-full flex flex-col items-center">
      <div className="max-w-[1280px]">
        <h2 className="text-3xl font-bold text-center mb-4">
          {formatToSentenceCase(t("affordabilitySection.title"))}
        </h2>
        <p className="text-center font-livvic mb-2 text-[#5C5B5B]">
          {t("affordabilitySection.content")}
        </p>

        <div className="flex flex-col md:flex-row gap-8  mt-8 items-stretch">
          {/* Left: Text Box */}
          <div className="bg-white border-2 border-red-700 rounded-xl transition-shadow ease-in-out duration-500 shadow-red-right-bottom-lg hover:shadow-red-right-bottom-xl p-6 flex-1 flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-2">
              {formatToSentenceCase(t("coverageSection.title"))}
            </h3>
            <p className="mb-4 font-medium font-livvic text-[#5C5B5B]">
              {t("coverageSection.intro")}
            </p>
            <ul className="">
              {t
                .raw("coverageSection.areas")
                .map(
                  (
                    {
                      name,
                      description,
                    }: { name: string; description: string },
                    index: number
                  ) => (
                    <li
                      key={index.toString()}
                      className="flex items-start gap-2"
                    >
                      <svg
                        width="20 "
                        height="20"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 15L17 24L32 9"
                          stroke="#BC2525"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M8 26L17 35L32 20"
                          stroke="#BC2525"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-[#565B5B]">
                        <span className="font-bold">{name}:</span> {description}
                      </span>
                    </li>
                  )
                )}
            </ul>
            <p className="font-medium font-livvic text-[#565B5B] mt-4">
              {t("coverageSection.conclusion")}
            </p>
          </div>
          {/* Right: Image */}
          <div className="flex-1 flex items-center justify-center">
            <Image
              src="/04.jpg"
              alt="Flyttman movers"
              width={1000}
              height={1000}
              className="rounded-xl object-cover w-full h-full shadow"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityAffordabilitySection;
