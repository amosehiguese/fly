import { formatToSentenceCase } from "@/lib/formatToSentenceCase";
import { AnimatedImage } from "./AnimatedImage";

export default function CityCommitment({
  t,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <section className="max-w-[1280px] py-16 md:py-24 px-6 md:px-16 flex flex-col md:flex-row gap-8 items-center bg-[#F4D7D9]/[0.2]">
      <div className="w-[95%] md:w-1/2">
        <AnimatedImage
          src="/06.jpg"
          alt="Flyttman worker packing boxes"
          width={600}
          height={400}
          borderColor="border-red-500"
        />
      </div>

      <div className="w-full md:w-1/2">
        <h2 className="md:text-4xl text-3xl font-urbanist font-extrabold mb-6">
          {formatToSentenceCase(t("commitmentSection.title"))}
        </h2>
        <p className="text-gray-700 font-medium leading-relaxed mb-6">
          {t("commitmentSection.content")}
        </p>
      </div>
    </section>
  );
}
