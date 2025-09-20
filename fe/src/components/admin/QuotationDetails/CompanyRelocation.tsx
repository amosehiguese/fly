import { CompanyRelocationQuotation } from "@/api/interfaces/admin/quotations";
import { formatNumber } from "@/lib/formatNumber";
import { parseArrayField } from "@/lib/parseArrayField";
import { useTranslations } from "next-intl";

const CompanyRelocationDetails = ({
  quotation,
}: {
  quotation: CompanyRelocationQuotation;
}) => {
  const t = useTranslations("quotation.companyRelocation");
  return (
    <div className="grid gap-4 grid-cols-2">
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("moveType")}
        </div>
        <div className="text-sm font-medium">
          {/* @ts-expect-error - Dynamic translation key from move_type string cannot be statically verified */}
          {t(`moveTypes.${quotation.move_type}`)}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("services.title")}
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
          {t("additionalServices")}
        </div>
        <div className="text-sm font-medium">
          {parseArrayField(quotation.additional_services).map((service) => (
            <div key={service}>
              <span className="text-gray-600 dark:text-gray-300">•</span>{" "}
              {/* @ts-expect-error - Dynamic translation key from esch additional services string cannot be statically verified */}
              {t(`additionalServiceOptions.${service}`)}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("specialInstructions")}
        </div>
        <div className="text-sm font-medium">
          {quotation.more_information || "N/A"}
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
          {t("distance")}
        </div>
        <div className="text-sm font-medium">
          {formatNumber(Number(quotation.distance))} km
        </div>
      </div>
    </div>
  );
};

export default CompanyRelocationDetails;
