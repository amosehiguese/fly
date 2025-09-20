import { ResidentialMoveQuotation } from "@/api/interfaces/admin/quotations";
import { formatNumber } from "@/lib/formatNumber";
import { parseArrayField } from "@/lib/parseArrayField";
import { useTranslations } from "next-intl";

const ResidentialMoveDetails = ({
  quotation,
}: {
  quotation: ResidentialMoveQuotation;
}) => {
  const t = useTranslations("quotation.privateMove");
  const tCommon = useTranslations("common");
  return (
    <div className="grid gap-4 grid-cols-2">
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("moveType")}
        </div>
        <div className="text-sm font-medium">
          {/* @ts-expect-error - Dynamic translation key from move_type string cannot be statically verified */}
          {t(`moveTypes.${quotation?.move_type.toLowerCase()}`)}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("propertySize")}
        </div>
        <div className="text-sm font-medium">{quotation.property_size} m²</div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("rok")}
        </div>
        <div className="text-sm font-medium">
          {t("fromRok")}: {quotation.from_rok} {t("rok")}
          <br />
          {t("toRok")}: {quotation.to_rok} {t("rok")}
        </div>
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
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("homeDescription")}
        </div>
        <div className="text-sm font-medium">
          {/* @ts-expect-error - Dynamic translation key from home_description string cannot be statically verified */}
          {t(`homeDescriptions.${quotation.home_description}`)}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("expectations")}
        </div>
        <div className="text-sm font-medium">
          {/* @ts-expect-error - Dynamic translation key from expectation string cannot be statically verified */}
          {t(`expectationOptions.${quotation.expectations}`)}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {tCommon("labels.distance")}
        </div>
        {formatNumber(Number(quotation.distance))} km
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("extent")}
        </div>
        <div className="text-sm font-medium">
          {/* @ts-expect-error - Dynamic translation key from extent string cannot be statically verified */}
          {t(`extentOptions.${quotation.extent}`)}
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
              {t(`services.${service.toLowerCase()}`)}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("garage")}
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
          {quotation.storage ? t("yes") : t("no")}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("other")}
        </div>
        <div className="text-sm font-medium">{quotation.other}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("insurance")}?
        </div>
        <div className="text-sm font-medium">
          {quotation.extra_insurance ? t("yes") : t("no")}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("rut")}?
        </div>
        <div className="text-sm font-medium">
          {quotation.rut_discount ? t("yes") : t("no")}
        </div>
      </div>

      {/* Add more residential move specific details */}
    </div>
  );
};

export default ResidentialMoveDetails;
