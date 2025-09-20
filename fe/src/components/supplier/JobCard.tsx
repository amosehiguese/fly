import { Job } from "@/types/supplier";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface JobCardProps {
  job: Job;
  onBidClick?: () => void;
  showStatus?: boolean;
}

const statusColors = {
  available: "text-blue-500 border-blue-500",
  pending: "text-yellow-500 border-yellow-500",
  "in-transit": "text-purple-500 border-purple-500",
  completed: "text-green-500 border-green-500",
};

export function JobCard({ job, onBidClick, showStatus = true }: JobCardProps) {
  const t = useTranslations("supplier");
  const tCommon = useTranslations("common");

  return (
    <Card className="overflow-hidden border-primary hover:shadow-lg transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {tCommon(
              `quotationTypes.${job.moveType.replace(" ", "_").toLowerCase()}`
            )}
          </h3>
          {showStatus && (
            <Badge
              variant="outline"
              className={cn(
                statusColors[job.status],
                "capitalize bg-white hover:bg-white"
              )}
            >
              {tCommon(`status.${job.status.toLowerCase()}`)}
            </Badge>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-x-2">
            <Truck className=" h-4 w-4 text-gray-500" />
            <div className="flex space-x-1">
              <p className="text-sm font-medium">{t("jobs.details.pickup")}:</p>
              <p className="text-sm text-gray-600">
                {job.pickup.address}, {job.pickup.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <MapPin className=" h-4 w-4 text-gray-500" />
            <div className="flex space-x-1">
              <p className="text-sm font-medium">
                {t("jobs.details.delivery")}:{" "}
              </p>
              <p className="text-sm text-gray-600">
                {job.delivery.address}, {job.delivery.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-x-1">
              <Activity className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {job.distance === "N/A" ? "N/A" : `${job.distance}km`}
              </span>
            </div>
            {job.hasFragileItems && (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {t("jobs.details.fragileItems")}:
                </span>
                <span className="text-sm text-gray-600">
                  {tCommon("answer.yes")}
                </span>
              </div>
            )}
          </div>
        </div>

        {
          <Link
            href={{
              pathname: "/supplier/quote",
              query: { id: job.id, table_name: job.moveType },
            }}
            className="flex justify-center"
          >
            <Button className="mt-4 px-12 bg-red-600 hover:bg-red-700">
              {t("jobs.actions.bid")}
            </Button>
          </Link>
        }
      </div>
    </Card>
  );
}
