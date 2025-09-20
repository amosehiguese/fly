import { HeavyLiftingQuotation } from "@/api/interfaces/admin/quotations";
import { formatNumber } from "@/lib/formatNumber";
import { parseArrayField } from "@/lib/parseArrayField";
import { useTranslations } from "next-intl";
const HeavyLiftingDetails = ({
  quotation,
}: {
  quotation: HeavyLiftingQuotation;
}) => {
  const t = useTranslations("quotation.heavyLifting");
  const tCommon = useTranslations("common");
  return (
    <div className="grid gap-4 grid-cols-2">
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("itemType")}
        </div>
        <div className="text-md font-medium">{quotation.item_type}</div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("itemCount")}
        </div>
        <div className="text-md font-medium">{quotation.item_count}</div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("itemValue")}
        </div>
        <div className="text-md font-medium">{quotation.item_value} SEK</div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("itemWeight")}
        </div>
        <div className="text-md font-medium">{quotation.item_weight} kg</div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {tCommon("floor")}
        </div>
        <div className="text-md font-medium">
          {tCommon("fromFloor")}: Floor {quotation.from_floor}
          <br />
          {t("toFloor")}: Floor {quotation.to_floor}
        </div>
      </div>
      <div className="text-md text-gray-600 dark:text-gray-300">
        {parseArrayField(quotation.services).map((service) => (
          <div key={service}>{service}</div>
        ))}
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("other")}
        </div>
        <div className="text-md font-medium">{quotation.other || "N/A"}</div>
      </div>

      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {tCommon("distance")}
        </div>
        {formatNumber(Number(quotation.distance))} km
      </div>
    </div>
  );
};

export default HeavyLiftingDetails;
