import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface DynamicAnimatedImageProps {
  images: { src: string; alt: string }[];
  width: number;
  height: number;
  borderColor?: string;
  className?: string;
  transitionInterval?: number;
}

export const DynamicAnimatedImage = ({
  images,
  width,
  height,
  borderColor = "border-red-600",
  className = "",
  transitionInterval = 5000,
}: DynamicAnimatedImageProps) => {
  // Calculate dimensions for the border that will be 90% of the image size
  const borderWidth = Math.floor(width * 0.85);
  const borderHeight = Math.floor(height * 0.75);

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(1);

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

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % images.length;
        // Change direction randomly for more dynamic animations
        if (Math.random() > 0.5) {
          setDirection(prevIndex > newIndex ? -1 : 1);
        } else {
          setDirection(Math.random() > 0.5 ? -1 : 1);
        }
        return newIndex;
      });
    }, transitionInterval);

    return () => clearInterval(timer);
  }, [images.length, transitionInterval]);

  // Animation variants for different transitions
  const variants = {
    slideInRight: {
      initial: { x: "100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "-100%", opacity: 0 },
    },
    slideInLeft: {
      initial: { x: "-100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "100%", opacity: 0 },
    },
    zoomFade: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 },
    },
    flipVertical: {
      initial: { rotateX: 90, opacity: 0 },
      animate: { rotateX: 0, opacity: 1 },
      exit: { rotateX: -90, opacity: 0 },
    },
  };

  // Array of animation types to randomly select from
  const animationTypes = [
    "slideInRight",
    "slideInLeft",
    "zoomFade",
    "flipVertical",
  ];

  // Get currently displayed image
  const currentImage = images[currentImageIndex] || { src: "", alt: "Image" };

  // Generate a random animation type for this render
  const randomAnimationType =
    animationTypes[Math.floor(Math.random() * animationTypes.length)];
  const selectedVariant =
    variants[randomAnimationType as keyof typeof variants];

  if (isSmallScreen) {
    return (
      <div className="relative w-full max-w-2xl px-4 mx-auto mb-12">
        {/* Border Container with fixed dimensions */}
        <div className="relative">
          {/* Border for mobile view */}
          <div
            className={`border-[3px] ${borderColor} absolute rounded-lg`}
            style={{
              top: "0px",
              left: "0px",
              width: "85%",
              height: "180px",
            }}
          ></div>

          {/* Image container for mobile */}
          <div
            className="relative z-10"
            style={{
              transform: "translate(15px, 20px)",
              width: "90%",
              height: "200px",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={
                  direction > 0
                    ? selectedVariant.initial
                    : { ...selectedVariant.exit, opacity: 0 }
                }
                animate={selectedVariant.animate}
                exit={
                  direction > 0
                    ? selectedVariant.exit
                    : { ...selectedVariant.initial, opacity: 0 }
                }
                transition={{
                  ease: "easeInOut",
                  duration: 0.7,
                }}
                className="absolute top-0 left-0 w-full h-full"
              >
                <Image
                  src={currentImage.src}
                  alt={currentImage.alt}
                  width={320}
                  height={200}
                  className={`rounded-lg ${className} object-cover w-full h-full`}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* The border - smaller than the image */}
      <div
        className={`border-[3px] ${borderColor} absolute rounded-lg`}
        style={{
          top: "0px",
          left: "0px",
          width: `${borderWidth}px`,
          height: `${borderHeight}px`,
        }}
      ></div>

      {/* The image carousel with animations */}
      <div
        className="relative z-10"
        style={{
          transform: "translate(30px, 40px)",
          width: `${borderWidth + 10}px`,
          height: `${borderHeight}px`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={
              direction > 0
                ? selectedVariant.initial
                : { ...selectedVariant.exit, opacity: 0 }
            }
            animate={selectedVariant.animate}
            exit={
              direction > 0
                ? selectedVariant.exit
                : { ...selectedVariant.initial, opacity: 0 }
            }
            transition={{
              ease: "easeInOut",
              duration: 0.7,
            }}
            className="absolute top-0 left-0 w-full h-full"
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              width={borderWidth + 10}
              height={borderHeight}
              className={`rounded-lg ${className} object-cover w-full h-full`}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
