import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeactivateUserAccountProps {
  title: string; // Title of the dialog
  description: string; // Description text of the dialog
  actionLabel: string; // Label for the action button
  cancelLabel?: string; // Optional label for the cancel button
  onAction: () => void; // Action handler function
}

function DeactivateUserAccount({
  title,
  description,
  actionLabel,
  cancelLabel = "Cancel",
  onAction,
}: DeactivateUserAccountProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="p-1 h-auto ">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeactivateUserAccount;
