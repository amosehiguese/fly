"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface AnimatedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  borderColor?: string;
  className?: string;
}

export const AnimatedImage = ({
  src,
  alt,
  width,
  height,
  borderColor = "border-red-600",
  className = "",
}: AnimatedImageProps) => {
  // Calculate dimensions for the border that will be 90% of the image size
  const borderWidth = Math.floor(width * 0.85);
  const borderHeight = Math.floor(height * 0.75);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    // Check window size on client side
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isSmallScreen) {
    return (
      <div className="relative w-full max-w-2xl px-4 mx-auto mb-12">
        {/* Border Container with fixed dimensions */}
        <div className="border-2 border-primary rounded-lg h-48 w-full relative overflow-hidden">
          {/* Centered & Perfectly Fitted Image */}
          <motion.div
            initial={{ x: "100%" }} // Starts completely off-screen right
            animate={{ x: 0 }} // Slides to perfectly fit container
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 15,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Image
              src="/06.jpg"
              alt="Centered Image"
              width={800}
              height={600}
              className="object-contain mx-8 rounded-lg max-h-full max-w-full"
              style={{
                // Ensures image never exceeds container
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* The red border - smaller than the image */}
      <div
        className={`border-[3px] ${borderColor} absolute rounded-lg`}
        style={{
          top: "0px",
          left: "0px",
          width: `${borderWidth}px`,
          height: `${borderHeight}px`,
        }}
      ></div>

      {/* The image that animates from the right */}
      <motion.div
        className="relative z-10 "
        initial={{ x: "100%", opacity: 0 }}
        whileInView={{ x: "30px", opacity: 1, y: "40px" }} // Offset by 10px to position relative to border
        viewport={{ once: true, amount: 0.1 }}
        transition={{
          ease: "easeInOut",
          duration: 1.5,
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={borderWidth + 10}
          height={borderHeight}
          className={`rounded-lg ${className}`}
        />
      </motion.div>
    </div>
  );
};
