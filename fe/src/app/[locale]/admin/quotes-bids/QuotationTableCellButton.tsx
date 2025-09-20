"use client";

import { TableCell } from "@/components/ui/table";
import { useTranslations } from "next-intl";
// import { useState } from "react";
import { Link } from "@/i18n/navigation";
// import { Modal } from "@/components/Modal";
import { getQuotationTypeKey } from "@/lib/getQuotationTypeKey";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeleteQuotation } from "@/hooks/admin/useFetchQuotations";

interface ActionButtonProps {
  row: string[];
  rowIndex: number;
  // handleClick: () => void;
}

export default function ClientTableCellButton({
  row,
}: // rowIndex,
ActionButtonProps) {
  // const [open, setOpen] = useState(false);
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // Get the technical key from the translated type
  const type = getQuotationTypeKey(row[1], locale);
  // console.log("type", type);
  // console.log("row", row);

  const { mutate: deleteQuotation, isPending: isDeleting } =
    useDeleteQuotation(setOpenDeleteDialog);

  const handleDeleteQuotation = () => {
    deleteQuotation({ id: row[0], type: type });
  };

  return (
    <TableCell>
      <div>
        <div className="flex items-center">
          <Link
            href={{
              pathname: `quotes-bids/quotation/${row[0]}`,
              query: { type },
            }}
            className="border-b w-24"
          >
            {tCommon("buttons.viewDetails")}
          </Link>
          {row[5] !== tCommon("status.awarded") && (
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(true)}
              className="ml-2"
            >
              {tCommon("buttons.delete")}
            </Button>
          )}
        </div>
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {tCommon("dialog.deleteQuotation.title")}
              </DialogTitle>
              <DialogDescription>
                {tCommon("dialog.deleteQuotation.description")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenDeleteDialog(false)}
              >
                {tCommon("dialog.deleteQuotation.cancel")}
              </Button>
              <Button onClick={handleDeleteQuotation}>
                {isDeleting
                  ? tCommon("buttons.deleting")
                  : tCommon("dialog.deleteQuotation.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TableCell>
  );
}
