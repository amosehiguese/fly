import { MyDispute } from "@/api/interfaces/customers/dashboard";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";

export const DisputeCard = ({ dispute }: { dispute: MyDispute }) => {
  // Get locale for dates and translations
  const locale = useLocale();
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");

  return (
    <Link href={`/customer/disputes/${dispute.dispute_id}`}>
      <div className="border border-gray-200 rounded-[20px] p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[20px] md:text-[24px] font-semibold">
            {t("disputeDetails.disputeId")} {dispute.dispute_id}
          </div>
          <div
            className={`px-4 py-1 rounded-full text-sm ${
              dispute.dispute_status === "pending"
                ? "bg-orange-100 text-orange-500"
                : "bg-green-100 text-green-500"
            }`}
          >
            {tCommon(`status.${dispute.dispute_status}`)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex">
            <span className="text-gray-600 w-32">
              {t("disputeDetails.disputeReason")}
            </span>
            <span>{dispute.reason}</span>
          </div>
          <div className="flex">
            <span className="text-gray-600 w-32">
              {tCommon("date.updatedOn")}
            </span>
            <span>
              {dispute.dispute_created_at &&
                formatDateLocale(dispute.dispute_created_at, locale)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
