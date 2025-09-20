"use client";

import useThemeStore from "@/store/ThemeStore";
import { Moon, Sun } from "lucide-react";
import React, { useEffect } from "react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  // Apply theme to <html> element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div
      className="flex items-center justify-between w-[54px] h-6 lg:h-8 md:w-16 p-1 bg-[#F4F4F2] rounded-full dark:bg-gray-800 cursor-pointer"
      onClick={toggleTheme}
    >
      <div
        className={`md:w-8 w-6 md:h-8 h-6 flex items-center justify-center rounded-full transform transition-transform ${
          theme === "dark"
            ? "translate-x-6 md:translate-x-8 bg-white"
            : "bg-black"
        }`}
      >
        {theme === "dark" ? (
          <span className="text-black justify-center items-center">
            <Moon className="" />
          </span> // Moon Icon
        ) : (
          <span className="text-white justify-center items-center">
            <Sun className="w-[16px] h-[16px] md:w-[24px] md:h-[24px]" />
          </span> // Sun Icon
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;
