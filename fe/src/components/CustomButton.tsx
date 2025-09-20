import { cn } from "@/lib/utils";
import React, { ButtonHTMLAttributes } from "react";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function CustomButton({ className, children, ...props }: CustomButtonProps) {
  return (
    <button
      style={{
        boxShadow: "2px 2px 0px 1px rgba(0, 0, 0, 0.5)",
      }}
      className={cn(
        "rounded-full py-2 bg-[#F4D7D9] px-10 font-medium text-sm transition-colors hover:opacity-90",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default CustomButton;
