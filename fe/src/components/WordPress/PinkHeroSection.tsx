"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Nav from "../homepage/Nav";

function PinkHeroSection({
  title,
  description,
  className,
  titleTextClassName = "lg:text-7xl text-5xl",
}: {
  title: string;
  description: string;
  className?: string;
  titleTextClassName?: string;
}) {
  return (
    <section
      className={cn(
        "w-full bg-[url('/pink-hero-bg.png')] bg-cover flex flex-col items-center  lg:h-[500px] py-4 px-4",
        className
      )}
    >
      <Nav />
      <div className="max-w-[1280px] mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`${titleTextClassName} lg:leading-[80px] leading-tight text-center font-extrabold text-[#3F3F3F] mb-4 font-urbanist mt-28 `}
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-gray-600 font-medium lg:leading-loose"
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}

export default PinkHeroSection;
