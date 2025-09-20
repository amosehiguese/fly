import { ResidentialMoveQuotation } from "@/api/interfaces/admin/quotations";
import { TranslatedText } from "@/components/TranslatedText";
import { formatNumber } from "@/lib/formatNumber";
import { parseArrayField, parseObjectField } from "@/lib/parseArrayField";
import { useTranslations } from "next-intl";
const ResidentialMoveDetails = ({
  quotation,
  type = "privateMove",
}: {
  quotation: ResidentialMoveQuotation;
  type?: string;
}) => {
  const t = useTranslations(`quotation.${type}`);
  const tSupplier = useTranslations("supplier");

  return (
    <div className="grid gap-4 grid-cols-2">
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("moveType")}
        </div>
        <div className="text-md font-medium">{quotation.move_type}</div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("propertySize")}
        </div>
        <div className="text-md font-medium">{quotation.property_size} m²</div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("rok")}
        </div>
        <div className="text-md font-medium">
          {t("fromRok")}: {quotation.from_rok} ROK
          <br />
          {t("toRok")}: {quotation.to_rok} ROK
        </div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("floor")}
        </div>
        <div className="text-md font-medium">
          {t("fromFloor")}: Floor {quotation.from_floor}
          <br />
          {t("toFloor")}: Floor {quotation.to_floor}
        </div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("homeDescription")}
        </div>
        <div className="text-md font-medium">
          {/* @ts-expect-error - Dynamic translation key from home_description string cannot be statically verified */}
          {t(`homeDescriptions.${quotation.home_description}`)}
        </div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("expectations")}
        </div>
        <div className="text-md font-medium">
          {/* @ts-expect-error - Dynamic translation key from expectation string cannot be statically verified */}
          {t(`expectationOptions.${quotation.expectations}`)}
        </div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {tSupplier("jobs.details.distance")}
        </div>
        {formatNumber(Number(quotation.distance))} km
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("extent")}
        </div>
        <div className="text-md font-medium">
          {/* @ts-expect-error - Dynamic translation key from extent string cannot be statically verified */}
          {t(`extentOptions.${quotation.extent}`)}
        </div>
      </div>
      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("services.title")}
        </div>
        <div className="text-md font-medium">
          {Array.isArray(quotation.services)
            ? quotation.services.map((service) => (
                <div key={service}>
                  <span className="text-gray-600 dark:text-gray-300">•</span>{" "}
                  {/* @ts-expect-error - Dynamic translation key from service string cannot be statically verified */}
                  {t(`services.${service}`)}
                </div>
              ))
            : quotation.services
                .replace("[", "")
                .replace("]", "")
                .replaceAll("\\", "")
                .replaceAll('"', "")
                .split(",")
                .map((service) => (
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
          {t("garage")}
        </div>
        <div className="text-md font-medium">
          {quotation.garage === 1 ? t("yes") : t("no")}
        </div>
      </div>
      {quotation.garage && (
        <div>
          <div className="text-md text-gray-600 dark:text-gray-300">
            {t("garageDescription")}
          </div>
          <div className="text-md font-medium">
            {quotation.garage_description}
          </div>
        </div>
      )}
      {/* <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("garage")}
        </div>
        <div className="text-md font-medium">
          {quotation.garage === 1 ? t("yes") : t("no")}
        </div>
      </div> */}

      {parseObjectField(quotation.storage).needed && (
        <div>
          <div className="text-md text-gray-600 dark:text-gray-300">
            {t("storage")}
          </div>
          <div className="text-md font-medium">
            {parseObjectField(quotation.storage).description || ""}
          </div>
        </div>
      )}

      <div>
        <div className="text-md text-gray-600 dark:text-gray-300">
          {t("other")}
        </div>
        <TranslatedText
          text={quotation.other || ""}
          className="text-md font-medium"
        />
      </div>

      {/* Add more residential move specific details */}
    </div>
  );
};

export default ResidentialMoveDetails;
