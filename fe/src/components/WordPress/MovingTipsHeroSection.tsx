import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Nav from "../homepage/Nav";
import Image from "next/image";

function MovingTipsHeroSection({
  title,
  className,
  titleTextClassName = "md:text-7xl text-5xl",
}: {
  title: string;
  description: string;
  className?: string;
  titleTextClassName?: string;
}) {
  return (
    <section
      className={cn(
        "w-full bg-[url('/pink-hero-bg.png')] bg-cover flex flex-col items-center  md:h-[500px] py-4 px-4",
        className
      )}
    >
      <Nav />
      <div className="max-w-[1280px] mx-auto fex flex-col items-center w-full text-center">
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`${titleTextClassName} md:leading-[80px] leading-tight text-center font-extrabold text-[#3F3F3F] mb-4 font-urbanist mt-28 mx-24 `}
        >
          {title}
        </motion.h1>

        <Image
          src="/05.jpg"
          alt="Flyttman moving team"
          width={1200}
          height={1000}
          className="lg:w-[70%] md:hidden w-full h-auto mb-6 mt-24 rounded-lg"
        />
      </div>
    </section>
  );
}

export default MovingTipsHeroSection;
