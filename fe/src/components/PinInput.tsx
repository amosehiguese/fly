"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface PinInputProps {
  length?: number;
  onComplete?: (pin: string) => void;
}

export function PinInput({ length = 4, onComplete }: PinInputProps) {
  const [pin, setPin] = useState<string[]>(Array(length).fill(""));
  const [showPin, setShowPin] = useState(true);

  const handleNumberClick = (number: string) => {
    const currentIndex = pin.findIndex((digit) => digit === "");
    if (currentIndex === -1) return;

    const newPin = [...pin];
    newPin[currentIndex] = number;
    setPin(newPin);

    if (currentIndex === length - 1) {
      onComplete?.(newPin.join(""));
      setPin(Array(length).fill(""));
    }
  };

  const handleDelete = () => {
    const lastFilledIndex = pin.map((digit) => digit !== "").lastIndexOf(true);
    if (lastFilledIndex === -1) return;

    const newPin = [...pin];
    newPin[lastFilledIndex] = "";
    setPin(newPin);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-8">
      {/* PIN Display */}
      <div className="flex justify-center gap-4 mb-8">
        {pin.map((digit, index) => (
          <div
            key={index}
            className={cn(
              "w-12 h-12 border-b-2 flex items-center justify-center text-2xl font-semibold",
              digit ? "border-primary" : "border-gray-300"
            )}
          >
            {showPin ? digit : digit ? "•" : ""}
          </div>
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <Button
            key={number}
            variant="ghost"
            className="h-16 text-2xl font-semibold hover:bg-gray-100"
            onClick={() => handleNumberClick(number.toString())}
          >
            {number}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="h-16 text-xl hover:bg-gray-100"
          onClick={() => setShowPin(!showPin)}
        >
          👁️
        </Button>
        <Button
          variant="ghost"
          className="h-16 text-2xl font-semibold hover:bg-gray-100"
          onClick={() => handleNumberClick("0")}
        >
          0
        </Button>
        <Button
          variant="ghost"
          className="h-16 text-xl hover:bg-gray-100"
          onClick={handleDelete}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
