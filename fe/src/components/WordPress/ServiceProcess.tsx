import AnimatedDiv from "@/components/AnimatedDiv";
import Image from "next/image";
import React from "react";

const ServiceProcess = ({
  title,
  processSteps,
}: {
  title: string;
  processSteps: string[];
}) => {
  return (
    <section className="px-2 py-12 md:px-16 lg:px-16 max-w-[1280px] mx-auto lg:py-16 bg-gray-50">
      <h2 className="text-3xl md:text-5xl font-urbanist font-extrabold  mb-8 text-center">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:px-24 px-4">
        <div className="relative">
          {/* Positioned element */}
          <AnimatedDiv
            className="absolute lg:top-5 md:-left-11 md:right-auto md:bottom-auto -left-4 -bottom-6 bg-white flex gap-4 rounded-[50px] shadow-lg shadow-black/[50%] z-30 px-4 py-2 items-center"
            transition={{ duration: 1, ease: "easeInOut" }}
            initial={{ y: 75, opacity: 0.5 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-full text-[20px] font-bold text-white">
              1
            </div>
            <h3 className="text-[16px] font-normal text-[#5C5B5B]">
              {processSteps[0]}
            </h3>
          </AnimatedDiv>
          <div className="border-t-[6px] border-l-[10px] border-[4px] md:rounded-tl-[100px] md:rounded-[2px] rounded-[20px] border-[#B21B18] p-2 ml-12 md:ml-0">
            <Image
              src="/05.jpg"
              alt="Plan & Prepare"
              layout="responsive"
              width={400}
              height={300}
              className="lg:rounded-[2px] md:rounded-tl-[100px] rounded-[20px] h-full"
            />
          </div>
        </div>
        <div className="relative">
          <AnimatedDiv
            className="absolute lg:-right-20 md:bottom-6 md:top-auto md:left-auto -right-2 -bottom-6 bg-white flex gap-4 rounded-[50px] shadow-lg shadow-black/[50%] z-30 px-4 py-2 items-center"
            transition={{ duration: 1, ease: "easeInOut" }}
            initial={{ y: 75, opacity: 0.5 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-full text-[20px] font-bold text-white">
              2
            </div>
            <h3 className="text-[16px] font-normal text-[#5C5B5B]">
              {processSteps[1]}
            </h3>
          </AnimatedDiv>
          <div className="border-t-[8px]  border-r-[10px] border-[4px] md:rounded-tr-[100px] md:rounded-[2px] rounded-[10px] border-[#B21B18] p-2 mr-12 md:mr-0">
            {/* <h3 className="text-xl font-semibold">Pack & Protect</h3> */}
            <Image
              src="/04.jpg"
              alt="Pack & Protect"
              layout="responsive"
              width={400}
              height={300}
              className="lg:rounded-tr-[100px] h-full md:rounded-[2px] rounded-[10px]"
            />
          </div>
        </div>
        <div className="relative">
          <AnimatedDiv
            className="absolute lg:top-4 md:-left-10 md:bottom-auto md:right-auto -bottom-6 bg-white flex gap-4 rounded-[50px] shadow-lg shadow-black/[50%] z-30 px-4 py-2 items-center"
            transition={{ duration: 1, ease: "easeInOut" }}
            initial={{ y: 75, opacity: 0.5 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-full text-[20px] font-bold text-white">
              3
            </div>
            <h3 className="text-[16px] font-normal text-[#5C5B5B]">
              {processSteps[2]}
            </h3>
          </AnimatedDiv>
          <div className="border-b-[8px] border-l-[10px] border-[4px] md:rounded-bl-[100px] md:rounded-[2px] rounded-[10px] border-[#B21B18] p-2 ml-12 md:ml-0">
            {/* <h3 >Move & Manage</h3> */}
            <Image
              src="/03.jpg"
              alt="Move & Manage"
              layout="responsive"
              width={400}
              height={300}
              className="lg:rounded-bl-[100px] md:rounded-[2px] rounded=[10px]"
            />
          </div>
        </div>
        <div className="relative">
          <AnimatedDiv
            className="absolute lg:-right-20 md:bottom-1 md:left-auto md:top-auto -right-8 -bottom-6 bg-white flex gap-4 rounded-[50px] shadow-lg shadow-black/[50%] z-30 px-4 py-2 items-center"
            transition={{ duration: 1, ease: "easeInOut" }}
            initial={{ y: 75, opacity: 0.5 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-full text-[20px] font-bold text-white">
              4
            </div>
            <h3 className="text-[16px] font-normal text-[#5C5B5B]">
              {processSteps[3]}
            </h3>
          </AnimatedDiv>
          <div className="border-b-[8px] border-r-[10px] border-[4px] md:rounded-br-[100px] md:rounded-[2px] rounded-[10px] border-[#B21B18] p-2 mr-12 md:mr-0">
            <Image
              src="/10.jpg"
              alt="Settle & Support"
              layout="responsive"
              width={400}
              height={300}
              className="lg:rounded-br-[100px] md:rounded-[2px] rounded-[10px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceProcess;
