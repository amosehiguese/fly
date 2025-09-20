import { AnimatedImage } from "./AnimatedImage";

const descriptionText = `At Flyttman, we specialize in making your move smooth, efficient, and
    stress-free, no matter the distance or circumstances. From local and
    long-distance relocations to international moves, our expert team
    handles every detail with precision. We cater to both personal and
    business needs, offering services like company relocations, estate
    clearances, heavy lifting, and even urgent evacuation moves. For added
    convenience, we provide storage solutions, move-out cleaning, and
    privacy-focused moves, ensuring that every aspect of your transition
    is taken care of with care and professionalism. With Flyttman, moving
    is made simple and secure.`;

export default function AboutService({
  title,
  description = descriptionText,
  servicesOffered,
}: {
  title: string;
  description: string;
  servicesOffered: string[];
  buttonText?: string;
  buttonLink?: string;
}) {
  return (
    <section className="max-w-[1280px] py-16 px-6 md:px-16 flex flex-col md:flex-row gap-8 md:gap-16 items-center md:justify-center">
      <div className="w-full md:w-1/2 ">
        <AnimatedImage
          src="/06.jpg"
          alt="Flyttman worker packing boxes"
          width={600}
          height={400}
          borderColor="border-red-500"
        />
      </div>

      <div className="w-full md:w-1/2">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{title}</h2>
        <p className="text-subtitle font-medium leading-relaxed mb-6">
          {description}
        </p>

        <ul className="">
          {servicesOffered.map((service) => (
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
              <span className="text-subtitle font-medium">{service}</span>
            </li>
          ))}
        </ul>
        {/* <Button
          onClick={() => router.push(buttonLink || "/contact")}
          className="bg-primary hover:bg-primary/80 mt-8"
        >
          {buttonText || "Contact Now"}
        </Button> */}
      </div>
    </section>
  );
}
