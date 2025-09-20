"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Quote } from "lucide-react";
import MaleTenant from "../svg/icons/male-tenant";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import useWindowSize from "@/hooks/useWindowSize";
// import QuoteMarks2Accent from "@assets/images/quote-marks-2.accent.svg";

interface Testimonial {
  author: string;
  text: string;
}

// const testimonials: Testimonial[] = [
//   {
//     name: "Robert Mason",
//     text: "After an emergency move, I was impressed with how quickly Flyttman responded. They took care of everything, and the clean-up was perfect. Truly a lifesaver!",
//     rating: 5,
//   },
//   {
//     name: "Michael Paul",
//     text: "I moved internationally with Flyttman, and they took care of all the details, including customs and transportation. The whole experience was smooth and stress-free.",
//     rating: 5,
//   },
//   {
//     name: "Jonathan Reece",
//     text: "Flyttman made my local move effortless! The team was fast, efficient, and handled everything with care. Highly recommend!",
//     rating: 5,
//   },
//   {
//     name: "",
//     gender: "male",
//     text: "",
//     rating: 5,
//   },
//   {
//     name: "",
//     gender: "male",
//     text: "",
//     rating: 5,
//   },
// ]

const TestimonialSection = () => {
  const t = useTranslations("home.testimonials");
  const { width } = useWindowSize(); // Use the custom hook
  const isSmallScreen = (width ?? 0) < 768; // Check for small screen

  return (
    <motion.div
      initial={{ opacity: 0.8, x: isSmallScreen ? 200 : 500 }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 1,
      }}
      viewport={{
        once: true,
      }}
      className="relative py-10 lg:py-20 lg:w-full w-[90vw] max-w-[1400px] mx-auto"
    >
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full  max-w-[1280px] mx-auto"
      >
        <CarouselContent className="-ml-2 lg:-ml-6">
          {t.raw("items").map((testimonial: Testimonial, index: number) => (
            <CarouselItem
              key={index.toString()}
              className="pl-2 lg:pl-6 basis-full sm:basis-1/2 lg:basis-1/3 pb-14"
            >
              <div className="bg-white shadow-lg relative rounded-lg p-4 lg:p-8 h-full flex flex-col overflow-visible">
                <div className="flex items-center justify-center">
                  <Quote className="text-primary w-8 h-8 lg:w-12 lg:h-12 mb-4 lg:mb-6" />
                </div>
                <div className="flex-grow mb-6">
                  <p className="text-[#666666] text-base lg:text-lg text-center leading-relaxed">
                    {testimonial.text}
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex justify-center mb-8">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="text-yellow-400 text-xl lg:text-2xl"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-16 left-0 right-0 z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-transparent shadow-md flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <MaleTenant />
                      </div>
                    </div>
                    <h4 className="mt-2 font-semibold text-base lg:text-lg text-black  px-4 py-1 rounded-full shadow-sm">
                      {testimonial.author}
                    </h4>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </motion.div>
  );
};

export default TestimonialSection;
