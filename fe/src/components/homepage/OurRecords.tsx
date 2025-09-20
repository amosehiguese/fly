"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { formatToSentenceCase } from "@/lib/formatToSentenceCase";

interface CounterProps {
  from: number;
  to: number;
  duration: number;
  decimalPlaces?: number;
  prefix?: string;
}

const Counter: React.FC<CounterProps> = ({
  from,
  to,
  duration,
  decimalPlaces = 0,
  prefix = "",
}) => {
  const [count, setCount] = useState<number>(from);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const counterRef = useRef<HTMLDivElement | null>(null); // Reference for the element

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setIsVisible(true); // Element is in the viewport
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.5,
    });

    const currentElement = counterRef.current; // Store the current ref value

    if (currentElement) {
      observer.observe(currentElement); // Start observing the element
    }

    // Cleanup function for the effect
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement); // Stop observing when the component unmounts
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return; // Skip animation if not visible

    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / (duration * 1000), 1);
      const newCount = from + progress * (to - from);

      const preciseCount = Number(newCount.toFixed(decimalPlaces));
      setCount(preciseCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    const animationFrameId = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrameId);
  }, [from, to, duration, decimalPlaces, isVisible]);

  return (
    <motion.div
      ref={counterRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="font-semibold"
    >
      {prefix}
      {count}
    </motion.div>
  );
};

const OurRecords: React.FC = () => {
  const t = useTranslations("home");
  const records = t.raw("records");
  // console.log("rec", records);

  return (
    <section className="flex md:flex-row flex-col w-full rounded-sm md:text-[24px] text-[20px]  md:space-x-16 bg-[#FFF1F2] py-8 text-white justify-between">
      <div className="max-w-[1280px] w-full mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 justify-between">
        <div className="md:border-r-2 py-2 md:py-0 border-b-2 md:border-b-0">
          <div className="font-semibold text-3xl md:text-5xl text-primary text-center md:text-left ">
            <Counter from={0} to={25} duration={1.5} prefix="+" />
          </div>
          <div className="text-center md:text-left text-[16px] text-black">
            {formatToSentenceCase(records.items[0].label)}
          </div>
        </div>

        <div className="md:border-r-2 py-2 md:py-0 border-b-2 md:border-b-0">
          <div className="font-semibold text-3xl md:text-5xl text-primary text-center">
            <Counter from={0} to={1999} duration={2} prefix="+" />
          </div>
          <div className="text-center  text-[16px] text-black">
            {records.items[1].label}
          </div>
        </div>

        <div className="py-2 md:py-0 ">
          <div className="font-semibold text-center md:text-right text-3xl md:text-5xl text-primary block ">
            <div className="flex justify-center md:justify-end">
              <Counter from={0} to={4.9} duration={1} decimalPlaces={2} />
              <div className="text-center md:text-right">/5</div>
            </div>
          </div>
          <div className="text-center md:text-right text-[16px] text-black">
            {records.items[2].label}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurRecords;
