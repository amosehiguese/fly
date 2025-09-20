import Image from "next/image";
import React from "react";

const AboutUsSection = () => {
  return (
    <section
      className="flex flex-col items-center mt-12 focus:animate-slideUp"
      // initial={{ opacity: 0, y: 20 }}
      // whileInView={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.6 }}
    >
      <div className="md:w-[70%] flex flex-col items-center">
        <div className="font-bold text-[26px] text-title my-2">About Us</div>
        <div className="text-center mb-8 font-semibold text-body">
          As a leading moving company, we offer reliable local and international
          moves within and outside Sweden. With competitive pricing,
          comprehensive insurance, and a commitment to customer satisfaction, we
          ensure a smooth and stress-free relocation experience.
        </div>
        <Image
          src={"/about-us.jpg"}
          width={500}
          height={500}
          className="w-full lg:h-[60vh] rounded-[16px]"
          alt="homepage image"
        />
      </div>
    </section>
  );
};

export default AboutUsSection;
