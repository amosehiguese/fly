"use client";

import { motion } from "framer-motion";
import { Button } from "./button";

interface SuccessModalProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  isOpen: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-6"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-4"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-8"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onButtonClick}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-md w-full"
          >
            {buttonText}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SuccessModal;
