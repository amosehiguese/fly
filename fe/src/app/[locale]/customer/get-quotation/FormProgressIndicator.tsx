"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
interface FormProgressIndicatorProps {
  stages: number; // Total number of stages
  currentStage: number; // Current active stage
  className?: string;
}

const FormProgressIndicator: React.FC<FormProgressIndicatorProps> = ({
  stages,
  currentStage,
  className = "",
}) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
      {Array.from({ length: stages }, (_, index) => {
        const stageNumber = index + 1;
        const isActive = stageNumber === currentStage;

        return (
          <React.Fragment key={stageNumber}>
            {/* Diamond Stage */}
            <motion.button
              onClick={() => {
                router.push(`/customer/get-quotation?stage=${stageNumber}`);
              }}
              disabled={stageNumber > currentStage}
              type="button"
              className={cn(
                "flex items-center justify-center w-8 h-8 border-2 rounded clip-path-square transform transition-all",
                isActive
                  ? "bg-red-500 text-white border-red-500 scale-110"
                  : "bg-gray-800 text-gray-400 border-gray-600",
                className
              )}
              initial={{ scale: 1 }}
              animate={isActive ? { scale: 1.2 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {stageNumber}
            </motion.button>

            {/* Dashed Line */}
            {stageNumber < stages && (
              <div className="flex-1 h-0.5 border-dashed border-t-2 border-gray-600"></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default FormProgressIndicator;
