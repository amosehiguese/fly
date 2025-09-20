import { MovingCleaningQuotation } from "@/api/interfaces/admin/quotations";
import { formatNumber } from "@/lib/formatNumber";
import { parseArrayField } from "@/lib/parseArrayField";
import { parseStorage } from "@/lib/parseQuotations";
import { useTranslations } from "next-intl";
const MovingCleaningDetails = ({
  quotation,
}: {
  quotation: MovingCleaningQuotation;
}) => {
  const t = useTranslations("quotation.moveOutCleaning");
  const tCommon = useTranslations("common");

  return (
    <div className="grid gap-4 grid-cols-2">
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("propertyType")}
        </div>
        <div className="text-md font-medium">
          {/* @ts-expect-error - Dynamic translation key from move_type string cannot be statically verified */}
          {t(`propertyTypes.${quotation.move_type}`)}
        </div>
      </div>

      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("propertySize")}
        </div>
        <div className="text-md font-medium">
          {quotation.pickup_property_size} m²
        </div>
      </div>

      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("numberOfRooms")}
        </div>
        <div className="text-md font-medium">{quotation.rok} ROK</div>
      </div>

      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("includesGarage")}
        </div>
        <div className="text-md font-medium">
          {quotation.garage ? tCommon("answer.yes") : tCommon("answer.no")}
        </div>
      </div>

      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("storage")}
        </div>
        <div className="text-md font-medium">
          {parseStorage(quotation.storage).needed
            ? tCommon("answer.yes")
            : tCommon("answer.no")}
          {parseStorage(quotation.storage).description &&
            `: ${parseStorage(quotation.storage).description}`}
        </div>
      </div>

      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("services.title")}
        </div>
        <div className="text-md font-medium">
          {parseArrayField(quotation.services).map((service) => (
            <div key={service}>
              <span className="text-gray-600 dark:text-gray-300">•</span>{" "}
              {/* @ts-expect-error - Dynamic translation key from service string cannot be statically verified */}
              {t(`services.${service}`)}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("other")}
        </div>
        <div className="text-md font-medium">{quotation.other || "N/A"}</div>
      </div>

      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("distance")}
        </div>
        {formatNumber(Number(quotation.distance))} km
      </div>
    </div>
  );
};

export default MovingCleaningDetails;
