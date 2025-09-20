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
  return (
    <div className="grid gap-4 grid-cols-2">
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("propertyType")}
        </div>
        <div className="text-sm font-medium">
          {/* @ts-expect-error - Dynamic translation key from move_type string cannot be statically verified */}
          {t(`propertyTypes.${quotation.move_type}`)}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("propertySize")}
        </div>
        <div className="text-sm font-medium">
          {quotation.pickup_property_size} m²
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("numberOfRooms")}
        </div>
        <div className="text-sm font-medium">
          {quotation.rok} {t("rok")}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("includesGarage")}
        </div>
        <div className="text-sm font-medium">
          {quotation.garage ? t("yes") : t("no")}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("storage")}
        </div>
        <div className="text-sm font-medium">
          {parseStorage(quotation.storage).needed ? t("yes") : t("no")}
          {parseStorage(quotation.storage).description &&
            `: ${parseStorage(quotation.storage).description}`}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("servicesNeeded")}
        </div>
        <div className="text-sm font-medium">
          {parseArrayField(quotation.services).map((service) => (
            <div key={service}>
              <span className="text-gray-600 dark:text-gray-300">•</span>{" "}
              {/* @ts-expect-error - Dynamic translation key from each service string cannot be statically verified */}
              {t(`services.${service}`)}
            </div>
          ))}
        </div>
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
          {quotation.rut_discount ? t("yes") : t("no")}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("insurance")}
        </div>
        <div className="text-sm font-medium">
          {quotation.extra_insurance ? "Yes" : "No"}
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

export default MovingCleaningDetails;
