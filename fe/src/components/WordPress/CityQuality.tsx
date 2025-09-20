import { formatToSentenceCase } from "@/lib/formatToSentenceCase";
import { AnimatedImage } from "./AnimatedImage";

export default function CityQuality({
  t,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <section className="max-w-[1280px] py-16 px-6 md:px-16 flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-1/2">
        <h2 className="md:text-4xl text-3xl font-urbanist font-extrabold mb-4">
          {formatToSentenceCase(t("qualitySection.title"))}
        </h2>
        <p className="text-gray-700 font-medium leading-relaxed mb-6">
          {t("qualitySection.content")}
        </p>
        <ul className="mb-4">
          {t.raw("qualitySection.listItems").map((service: string) => (
            <li key={service} className="flex items-center gap-2">
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
              <span className="text-[#565B5B] font-medium">{service}</span>
            </li>
          ))}
        </ul>
        <p className="text-gray-700 font-medium leading-relaxed mb-6">
          {t("qualitySection.conclusion")}
        </p>
      </div>

      <div className="w-full md:w-1/2">
        <AnimatedImage
          src="/05.jpg"
          alt="Flyttman worker packing boxes"
          width={600}
          height={400}
          borderColor="border-red-500"
        />
      </div>
    </section>
  );
}
