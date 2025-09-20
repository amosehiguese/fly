import { formatToSentenceCase } from "@/lib/formatToSentenceCase";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CityMovingService = ({ t }: { t: any }) => {
  return (
    <section className="px-6 md:px-16 w-full flex flex-col items-center">
      <div className="max-w-[1280px]">
        <div className="bg-pink-50 flex flex-col md:flex-row gap-8  mt-8 items-stretch">
          {/* Left: Text Box */}
          <div className=" md:pl-6 pl-3 pr-3 md:pr-0 md:w-1/2 flex-1 flex flex-col justify-center py-6 md:py-12">
            <h3 className="text-xl md:text-3xl font-bold mb-2">
              {formatToSentenceCase(t("servicesSection.title"))}
            </h3>
            <p className="mb-4 font-medium font-livvic text-[#5C5B5B]">
              {t("servicesSection.intro")}
            </p>
            <ul className="">
              {t
                .raw("servicesSection.listItems")
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
          </div>
          {/* Right: Image */}
          <div className="md:w-1/2 px-4 md:px-0 ">
            <Image
              src="/03.jpg"
              alt="Flyttman movers"
              width={1000}
              height={1000}
              className="object-cover w-full h-full shadow"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityMovingService;
