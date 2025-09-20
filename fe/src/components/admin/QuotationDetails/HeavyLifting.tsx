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
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("itemType")}
        </div>
        <div className="text-sm font-medium">
          {/* @ts-expect-error - Dynamic translation key from item_type string cannot be statically verified */}
          {t(`itemTypes.${quotation.item_type}`)}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("itemCount")}
        </div>
        <div className="text-sm font-medium">{quotation.item_count}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("itemValue")}
        </div>
        <div className="text-sm font-medium">{quotation.item_value} SEK</div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("itemWeight")}
        </div>
        <div className="text-sm font-medium">{quotation.item_weight} kg</div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("floor")}
        </div>
        <div className="text-sm font-medium">
          {t("fromFloor")}: {quotation.from_floor} <br />
          {t("toFloor")}: {quotation.to_floor}{" "}
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {parseArrayField(quotation.services).map((service) => (
          <div key={service}>
            {/* @ts-expect-error - Dynamic translation key from each service string cannot be statically verified */}
            {t(`services.${service}`)}
          </div>
        ))}
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("other")}
        </div>
        <div className="text-sm font-medium">{quotation.other || "N/A"}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("rut")}
        </div>
        <div className="text-sm font-medium">
          {quotation.rut_discount ? "Yes" : "No"}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("insurance")}
        </div>
        <div className="text-sm font-medium">
          {quotation.extra_insurance
            ? tCommon("answer.yes")
            : tCommon("answer.no")}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("distance")}
        </div>
        {formatNumber(Number(quotation.distance))} km
      </div>
    </div>
  );
};

export default HeavyLiftingDetails;
