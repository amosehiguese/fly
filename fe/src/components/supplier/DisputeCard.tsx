import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { useLocale } from "next-intl";
import { useTranslations } from "use-intl";

interface DisputeCardProps {
  dispute: {
    dispute_id: number;
    reason: string;
    status: "pending" | "resolved" | "in-review";
    updated_at: string | null;
  };
}

const statusColors = {
  pending: "text-yellow-500 border-yellow-500",
  resolved: "text-green-500 border-green-500",
  "in-review": "text-blue-500 border-blue-500",
};

export function DisputeCard({ dispute }: DisputeCardProps) {
  const locale = useLocale();
  const t = useTranslations("admin.disputeDetails");
  const tCommon = useTranslations("common");

  return (
    <Card className="overflow-hidden border-primary hover:shadow-lg transition-all duration-300">
      <div className="p-4">
        <Link href={`/supplier/disputes/${dispute.dispute_id}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {t("details.disputeId")}: {dispute.dispute_id}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                statusColors[dispute.status],
                "capitalize bg-white hover:bg-white"
              )}
            >
              {tCommon(`status.${dispute.status}`)}
            </Badge>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm font-medium">
                {t("details.disputeReason")}:
              </p>
              <p className="text-sm text-gray-600">{dispute.reason}</p>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-500" />
              <div className="flex space-x-1">
                <p className="text-sm font-medium">{t("details.updatedAt")}:</p>
                <p className="text-sm text-gray-600">
                  {(dispute.updated_at &&
                    formatDateLocale(
                      dispute.updated_at,
                      locale,
                      "dd MMM yyyy"
                    )) ||
                    "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </Card>
  );
}
