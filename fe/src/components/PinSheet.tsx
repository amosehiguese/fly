"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { PinInput } from "@/components/PinInput";

interface PinSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (pin: string) => void;
}

export function PinSheet({ isOpen, onClose, onComplete }: PinSheetProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="px-4">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-2xl font-semibold">
            Enter your pin
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <PinInput length={4} onComplete={onComplete} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
