import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SupplierOrder } from "@/api/interfaces/admin/suppliers";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { formatToQuotationType } from "@/lib/formatToQuotationType";

interface OrdersTableProps {
  orders: SupplierOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const t = useTranslations("admin.tableHeaders");
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{tCommon("labels.order")}</h2>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("orderId")}</TableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.order_id}>
                <TableCell>{order.order_id}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  {tCommon(
                    `quotationTypes.${formatToQuotationType(order.quotation_type)}`
                  )}
                </TableCell>
                <TableCell>
                  SEK {parseFloat(order.total_amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      order.order_status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.order_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.order_status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {tCommon(`status.${order.order_status}`)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    {tCommon("buttons.viewDetails")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
