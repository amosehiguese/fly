import { SupplierRatings } from "@/api/interfaces/admin/suppliers";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface MovingInformationProps {
  registrationDate: string;
  totalMoves: number;
  totalDisputes: number;
  ratings: SupplierRatings;
}

export function MovingInformation({
  registrationDate,
  totalMoves,
  totalDisputes,
  ratings,
}: MovingInformationProps) {
  const t = useTranslations("admin.suppliers.details");

  return (
    <div className="bg-white rounded-lg p-6 shadow dark:text-black">
      <h2 className="text-lg font-semibold mb-4">
        {t("tabs.movingInformation")}
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">
            {t("movingInfo.registrationDate")}:
          </span>
          <span>
            {registrationDate &&
              format(new Date(registrationDate), "MMM dd, yyyy")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t("movingInfo.totalMoves")}:</span>
          <span>{totalMoves}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">
            {t("movingInfo.totalDisputes")}:
          </span>
          <span>{totalDisputes}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t("movingInfo.ratings")}:</span>
          <span>
            {ratings?.average_rating || 0}/5{" "}
            {t("supplierInfo.basedOnReviews", {
              count: ratings?.total_reviews || 0,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
