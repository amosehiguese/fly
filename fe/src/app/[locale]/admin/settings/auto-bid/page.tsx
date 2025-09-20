"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DurationInput } from "@/components/DurationInput";
import { useFixedPercentage } from "@/hooks/admin/useFixedPercentage";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function AutoBidSettings() {
  const { data, updatePercentage, isUpdating } = useFixedPercentage();
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [movingCostPercentage, setMovingCostPercentage] = useState<
    number | undefined
  >();
  const [additionalServicePercentage, setAdditionalServicePercentage] =
    useState<number | undefined>();
  const [truckCost, setTruckCost] = useState<number | undefined>();
  const [auctionDuration, setAuctionDuration] = useState<number | undefined>();
  const [auctionSecondaryDuration, setAuctionSecondaryDuration] = useState<
    number | undefined
  >();
  const [highValueBidThreshold, setHighValueBidThreshold] = useState<
    number | undefined
  >();

  // Initialize state from data when it loads
  useEffect(() => {
    if (data) {
      setMovingCostPercentage(data.moving_cost_percentage);
      setAdditionalServicePercentage(data.additional_services_percentage);
      setTruckCost(data.cost_of_truck);
      setAuctionDuration(data.auction_duration_minutes);
      setAuctionSecondaryDuration(data.auction_secondary_duration_minutes);
      setHighValueBidThreshold(data.high_value_bid_threshold);
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePercentage({
      moving_cost_percentage: movingCostPercentage || 0,
      additional_services_percentage: additionalServicePercentage || 0,
      cost_of_truck: truckCost || 0,
      auction_duration_minutes: auctionDuration || 0,
      auction_secondary_duration_minutes: auctionSecondaryDuration || 0,
      high_value_bid_threshold: highValueBidThreshold || 0,
    });
  };

  return (
    <div className="flex-col flex-1 p-6">
      <h2 className="text-2xl font-semibold mb-6">{tAdmin("autobid.title")}</h2>
      <div className="max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {tAdmin("autobid.movingCostPercentage")}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={movingCostPercentage}
                  onChange={(e) =>
                    setMovingCostPercentage(Number(e.target.value))
                  }
                  min={0}
                  max={100}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {tAdmin("autobid.additionalServicePercentage")}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={additionalServicePercentage}
                  onChange={(e) =>
                    setAdditionalServicePercentage(Number(e.target.value))
                  }
                  min={0}
                  max={100}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {tAdmin("autobid.highValueBidThreshold")}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={highValueBidThreshold}
                  onChange={(e) =>
                    setHighValueBidThreshold(Number(e.target.value))
                  }
                  className="pr-8"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  SEK
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {tAdmin("autobid.truckCost")}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={truckCost}
                  onChange={(e) => setTruckCost(Number(e.target.value))}
                  min={0}
                  className="pr-8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {tAdmin("autobid.auctionDuration")}{" "}
                <span className="text-xs text-gray-500">
                  {tAdmin("autobid.auctionDurationHint")}
                </span>
              </label>
              <DurationInput
                value={auctionDuration || 0}
                onChange={setAuctionDuration}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {tAdmin("autobid.autobidDuration")}{" "}
                <span className="text-xs text-gray-500">
                  {tAdmin("autobid.autobidDurationHint")}
                </span>
              </label>
              <DurationInput
                value={auctionSecondaryDuration || 0}
                onChange={setAuctionSecondaryDuration}
              />
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {tAdmin("autobid.percentageHint")}
            </p>

            <Button type="submit" disabled={isUpdating} className="w-full">
              {isUpdating
                ? tCommon("buttons.updating")
                : tCommon("buttons.saveChanges")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
