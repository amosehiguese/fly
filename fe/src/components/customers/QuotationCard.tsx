import { Package, MapPin, Clock } from "lucide-react";
import { BaseQuotation } from "@/api/interfaces/customers/dashboard";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";

export const QuotationCard = ({
  quotation,
}: {
  quotation: BaseQuotation & { service_type: string };
}) => {
  // Get locale for dates and translations
  const locale = useLocale();
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");

  const renderServiceIcon = () => {
    switch (quotation.service_type) {
      case "Moving & Cleaning":
        return <Package className="w-5 h-5 text-white" />;
      case "Heavy Lifting":
        return <Package className="w-5 h-5 text-white" />;
      case "Evacuation Move":
        return <Package className="w-5 h-5 text-white" />;
      default:
        return <Package className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div
      //   href={`/customer/quotations/${quotation.quotation_number}`}
      className="border border-[#D3D3D3] rounded-[20px] p-4 mb-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-x-2">
            <div className="bg-primary rounded-full p-2">
              {renderServiceIcon()}
            </div>
            <div className="flex flex-col text-xs md:text-sm">
              <div className="font-bold">
                {t("quotations.orderId")}: {quotation.id}
              </div>
              <div>{tCommon(`quotationTypes.${quotation.service_type}`)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <span className="text-sm">{quotation.pickup_address}</span>
        <span className="text-sm">{quotation.delivery_address}</span>
      </div>

      <div className="flex items-center justify-between text-gray-600 mt-2 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {t("quotations.distanceNotAvailable")}
            {/* {quotation.distance ? `${quotation.distance} km` : "Distance N/A"} */}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {t("quotations.until")}{" "}
            {formatDateLocale(quotation.latest_date, locale)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {tCommon("date.dateCreated")}:{" "}
          {formatDateLocale(quotation.created_at, locale)}
        </span>
        {/* {quotation.price && (
          <span className="font-semibold text-black">
            SEK {quotation.price.toLocaleString()}
          </span>
        )} */}
      </div>
    </div>
  );
};
