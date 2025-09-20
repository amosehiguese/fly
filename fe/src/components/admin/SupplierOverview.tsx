import { useTranslations } from "next-intl";

interface SupplierOverviewProps {
  totalMovers: number;
  pendingApprovals: number;
}

export function SupplierOverview({
  totalMovers,
  pendingApprovals,
}: SupplierOverviewProps) {
  const t = useTranslations("admin.suppliers");

  return (
    <div className="">
      <h2 className="text-xl font-semibold mb-4">{t("title")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-black border-l-8 border-black dark:border-white  p-6 rounded-lg shadow">
          <h3 className="text-4xl font-bold">{totalMovers}</h3>
          <p className="text-gray-600 dark:text-white">
            {t("overview.totalMovers")}
          </p>
        </div>
        <div className="bg-white dark:bg-black p-6 rounded-lg shadow border-l-8 border-black dark:border-white">
          <h3 className="text-4xl font-bold">{pendingApprovals}</h3>
          <p className="text-gray-600 dark:text-white">
            {t("overview.pendingApprovals")}
          </p>
        </div>
      </div>
    </div>
  );
}
