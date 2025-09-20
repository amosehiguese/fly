import AnimatedDiv from "@/components/AnimatedDiv";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

const OurDeliveryProcess = () => {
  const t = useTranslations("home.deliveryProcess");
  // console.log("fg", t.raw("steps")[0].title);

  return (
    <section className="px-2 py-12 lg:px-16 lg:px-16 max-w-[1280px] w-full mx-auto lg:py-16">
      <h2 className="text-3xl font-livvic lg:text-5xl mb-4 font-extrabold text-center">
        {t("title")}
      </h2>
      <div className="flex justify-center">
        <p className="font-medium text-subtitle mb-8 px-4 lg:px-0 text-center w-[500px]">
          {t("description")}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:px-24 px-6">
        <div className="relative">
          {/* Positioned element */}
          <AnimatedDiv
            className="absolute lg:top-5 lg:-left-11 lg:right-auto lg:bottom-auto -left-4 -bottom-6 bg-white flex gap-4 rounded-[50px] shadow-lg shadow-black/[50%] z-30 px-4 py-2 items-center"
            transition={{ duration: 1, ease: "easeInOut" }}
            initial={{ y: 75, opacity: 0.5 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-full text-[20px] font-bold text-white">
              1
            </div>
            <h3 className="text-[16px] font-normal text-[#5C5B5B]">
              {t.raw("steps")[0].title}
            </h3>
          </AnimatedDiv>
          <div className="border-t-[6px] border-l-[10px] border-[4px] lg:rounded-tl-[100px] lg:rounded-[2px] rounded-[20px] border-[#B21B18] p-2 ml-12 lg:ml-0">
            <Image
              src="/05.jpg"
              alt="Plan & Prepare"
              layout="responsive"
              quality={100}
              width={2000}
              height={2000}
              className="lg:rounded-[2px] lg:rounded-tl-[100px] rounded-[20px] h-full"
            />
          </div>
        </div>
        <div className="relative">
          <AnimatedDiv
            className="absolute lg:-right-20 lg:bottom-6 lg:top-auto lg:left-auto -right-2 -bottom-6 bg-white flex gap-4 rounded-[50px] shadow-lg shadow-black/[50%] z-30 px-4 py-2 items-center"
            transition={{ duration: 1, ease: "easeInOut" }}
            initial={{ y: 75, opacity: 0.5 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-full text-[20px] font-bold text-white">
              2
            </div>
            <h3 className="text-[16px] font-normal text-[#5C5B5B]">
              {t.raw("steps")[1].title}
            </h3>
          </AnimatedDiv>
          <div className="border-t-[8px]  border-r-[10px] border-[4px] lg:rounded-tr-[100px] lg:rounded-[2px] rounded-[10px] border-[#B21B18] p-2 mr-12 lg:mr-0">
            {/* <h3 className="text-xl font-semibold">Pack & Protect</h3> */}
            <Image
              src="/04.jpg"
              alt="Pack & Protect"
              layout="responsive"
              quality={100}
              width={2000}
              height={2000}
              className="lg:rounded-tr-[100px] h-full lg:rounded-[2px] rounded-[10px]"
            />
          </div>
        </div>
        <div className="relative">
          <AnimatedDiv
            className="absolute lg:top-4 lg:-left-10 lg:bottom-auto lg:right-auto -bottom-6 bg-white flex gap-4 rounded-[50px] shadow-lg shadow-black/[50%] z-30 px-4 py-2 items-center"
            transition={{ duration: 1, ease: "easeInOut" }}
            initial={{ y: 75, opacity: 0.5 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-full text-[20px] font-bold text-white">
              3
            </div>
            <h3 className="text-[16px] font-normal text-[#5C5B5B]">
              {t.raw("steps")[2].title}
            </h3>
          </AnimatedDiv>
          <div className="border-b-[8px] border-l-[10px] border-[4px] lg:rounded-bl-[100px] lg:rounded-[2px] rounded-[10px] border-[#B21B18] p-2 ml-12 lg:ml-0">
            {/* <h3 >Move & Manage</h3> */}
            <Image
              src="/03.jpg"
              alt="Move & Manage"
              layout="responsive"
              quality={100}
              width={2000}
              height={2000}
              className="lg:rounded-bl-[100px] lg:rounded-[2px] rounded=[10px]"
            />
          </div>
        </div>
        <div className="relative">
          <AnimatedDiv
            className="absolute lg:-right-20 lg:bottom-1 lg:left-auto lg:top-auto -right-8 -bottom-6 bg-white flex gap-4 rounded-[50px] shadow-lg shadow-black/[50%] z-30 px-4 py-2 items-center"
            transition={{ duration: 1, ease: "easeInOut" }}
            initial={{ y: 75, opacity: 0.5 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-full text-[20px] font-bold text-white">
              4
            </div>
            <h3 className="text-[16px] font-normal text-[#5C5B5B]">
              {t.raw("steps")[3].title}
            </h3>
          </AnimatedDiv>
          <div className="border-b-[8px] border-r-[10px] border-[4px] lg:rounded-br-[100px] lg:rounded-[2px] rounded-[10px] border-[#B21B18] p-2 mr-12 lg:mr-0">
            <Image
              src="/10.jpg"
              alt="Settle & Support"
              layout="responsive"
              quality={100}
              width={2000}
              height={2000}
              className="lg:rounded-br-[100px] lg:rounded-[2px] rounded-[10px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurDeliveryProcess;
