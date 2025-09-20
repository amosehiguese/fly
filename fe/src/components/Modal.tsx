import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogOverlay } from "@radix-ui/react-dialog";
import { ReactNode } from "react";

export function Modal({
  children,
  isOpen,
  defaultOpen = false,
  onOpenChange,
}: {
  children: ReactNode;
  isOpen: boolean;
  defaultOpen?: boolean;
  onOpenChange?: () => void;
}) {
  return (
    <Dialog open={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="">
        <DialogContent className="overflow-y-hidden ">{children}</DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
