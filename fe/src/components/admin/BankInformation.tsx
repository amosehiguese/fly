import { useTranslations } from "next-intl";

interface BankInformationProps {
  bank: string;
  accountNumber: string;
  iban: string;
}

export function BankInformation({
  bank,
  accountNumber,
  iban,
}: BankInformationProps) {
  const t = useTranslations("admin.suppliers.details");

  return (
    <div className="bg-white rounded-lg p-6 shadow dark:text-black">
      <h2 className="text-lg font-semibold mb-4">
        {t("tabs.bankInformation")}
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">{t("bankInfo.bank")}:</span>
          <span>{bank}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t("bankInfo.accountNumber")}:</span>
          <span>{accountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t("bankInfo.iban")}:</span>
          <span>{iban}</span>
        </div>
      </div>
    </div>
  );
}
