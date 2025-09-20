"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface TipSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function TipSlider({
  value,
  min = 5,
  max = 2000,
  step = 5,
  onChange,
  className = "",
}: TipSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Convert value to percentage
  const valueToPercentage = useCallback(
    (val: number) => {
      return ((val - min) / (max - min)) * 100;
    },
    [min, max]
  );

  // Convert percentage to value
  const percentageToValue = useCallback(
    (percentage: number) => {
      const rawValue = min + (percentage / 100) * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step]
  );

  // Update value based on position
  const updateValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(100, ((clientX - rect.left) / rect.width) * 100)
      );
      const newValue = percentageToValue(percentage);

      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [value, onChange, percentageToValue]
  );

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      updateValueFromPosition(e.clientX);
    },
    [updateValueFromPosition]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValueFromPosition(e.clientX);
      }
    },
    [isDragging, updateValueFromPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      const touch = e.touches[0];
      updateValueFromPosition(touch.clientX);
    },
    [updateValueFromPosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        updateValueFromPosition(e.touches[0].clientX);
      }
    },
    [isDragging, updateValueFromPosition]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Generate tick marks for visual reference
  const generateTicks = () => {
    const tickValues = [5, 10, 25, 50, 100, 250, 500];

    return tickValues
      .map((tickValue) => {
        if (tickValue <= max) {
          const percentage = valueToPercentage(tickValue);
          const isActive = value >= tickValue;

          return (
            <div
              key={tickValue}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${percentage}%` }}
            >
              {/* Tick mark */}
              <div
                className={`w-0.5 transition-all duration-200 ${
                  isActive
                    ? tickValue ===
                      Math.min(...tickValues.filter((t) => t >= value))
                      ? "h-12 bg-black"
                      : "h-6 bg-[#A5A5A5]"
                    : "h-4 bg-[#D5D5D5]"
                }`}
              />
              {/* Tick label */}
              {[10, 50, 100, 500, 1000, 2000].includes(tickValue) && (
                <span className="text-[10px] text-[#BBBBBB] mt-2 font-light whitespace-nowrap">
                  {tickValue}
                </span>
              )}
            </div>
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  const currentPercentage = valueToPercentage(value);

  return (
    <div className={`relative ${className}`}>
      {/* Track */}
      <div
        ref={sliderRef}
        className="relative w-full h-16 cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Background track */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-[#F0F0F0] rounded-full" />

        {/* Active track */}
        <div
          className="absolute top-4 left-0 h-1 bg-gradient-to-r from-[#A5A5A5] to-black rounded-full transition-all duration-200"
          style={{ width: `${currentPercentage}%` }}
        />

        {/* Tick marks */}
        {generateTicks()}

        {/* Thumb */}
        <div
          ref={thumbRef}
          className="absolute top-2 w-5 h-5 bg-black rounded-full shadow-lg cursor-grab transition-all duration-200 hover:scale-110 active:cursor-grabbing"
          style={{
            left: `calc(${currentPercentage}% - 10px)`,
            transform: isDragging ? "scale(1.2)" : "scale(1)",
          }}
        />

        {/* Value tooltip */}
        <div
          className="absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
          style={{
            left: `calc(${currentPercentage}% - 20px)`,
            opacity: isDragging ? 1 : 0,
            transition: "opacity 200ms",
          }}
        >
          SEK {value}
        </div>
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-[10px] text-[#BBBBBB] mt-2">
        <span>SEK{min}</span>
        <span>SEK{max}</span>
      </div>
    </div>
  );
}
