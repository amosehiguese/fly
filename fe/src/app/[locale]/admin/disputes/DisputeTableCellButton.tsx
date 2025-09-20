"use client";

import { TableCell } from "@/components/ui/table";
import Link from "next/link";
import { useTranslations } from "next-intl";
// import { Modal } from "@/components/Modal";

interface ActionButtonProps {
  row: string[];
  rowIndex: number;
  // handleClick: () => void;
}

export default function DisputeTableCellButton({ row }: ActionButtonProps) {
  const t = useTranslations("common");

  return (
    <TableCell className="min-w-32">
      <Link href={`/admin/disputes/${row[0]}`} className="border-b">
        {t("buttons.viewDetails")}
      </Link>
    </TableCell>
  );
}
