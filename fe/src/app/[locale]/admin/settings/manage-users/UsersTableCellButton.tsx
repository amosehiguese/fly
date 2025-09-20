"use client";

import { TableCell } from "@/components/ui/table";
import DeactivateUserAccount from "./DeactivateUserAlert";
import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdmin } from "@/api/admin";

interface ActionButtonProps {
  row: string[];
  rowIndex: number;
  // handleClick: () => void;
}

export default function UsersTableCellButton({
  row,
}: //   row,
// rowIndex,
ActionButtonProps) {
  const adminId = row[0];
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ["delete-admin", adminId],
    mutationFn: () => deleteAdmin(adminId),
    onSuccess: (data) => {
      toast(data.message || `user with ${adminId} deleted`, {
        position: "top-center",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return (
    <TableCell className="items-center flex space-x-2">
      <DeactivateUserAccount
        actionLabel={mutation.isPending ? "Deleting..." : "Deactivate"}
        description="Are you sure you want to delete this admin ?"
        onAction={() => mutation.mutate()}
        title="Delete Admin"
        cancelLabel="Cancel"
      />
    </TableCell>
  );
}
