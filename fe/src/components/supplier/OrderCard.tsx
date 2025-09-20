import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/api/interfaces/suppliers";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface OrderCardProps {
  order: Order;
  showStatus?: boolean;
}

const statusColors = {
  accepted: "text-blue-500 border-blue-500",
  ongoing: "text-yellow-500 border-yellow-500",
  delivered: "text-purple-500 border-purple-500",
  failed: "text-red-500 border-red-500",
  completed: "text-green-500 border-green-500",
};

export function OrderCard({ order, showStatus = true }: OrderCardProps) {
  const tCommon = useTranslations("common");
  const tSupplier = useTranslations("supplier");

  return (
    <Card className="overflow-hidden border-primary hover:shadow-lg transition-all duration-300 p-2">
      <Link href={`/supplier/orders/${order.order_id}`} className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-16px font-semibold">
            {tSupplier("ongoingOrder.orderId")}: {order.order_id}
          </h3>
          {showStatus && (
            <Badge
              variant="outline"
              className={cn(
                statusColors[order.order_status],
                "capitalize bg-white hover:bg-white"
              )}
            >
              {tCommon(`status.${order.order_status}`)}
            </Badge>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-x-2">
            <Truck className="h-4 w-4 text-gray-500" />
            <div className="flex space-x-1">
              <p className="text-sm font-medium">
                {tSupplier("ongoingOrder.pickup")}:
              </p>
              <p className="text-sm text-gray-600">{order.pickup_location}</p>
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div className="flex space-x-1">
              <p className="text-sm font-medium">
                {tSupplier("ongoingOrder.delivery")}:{" "}
              </p>
              <p className="text-sm text-gray-600">{order.delivery_location}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-x-1">
              <Activity className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">NA</span>
            </div>
            {/* {order.hasFragileItems && (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">Fragile Items:</span>
                <span className="text-sm text-gray-600">Yes</span>
              </div>
            )} */}
          </div>
        </div>
      </Link>
    </Card>
  );
}
