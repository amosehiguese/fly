"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api, { ErrorResponse, handleMutationError } from "@/api";
import { formatNumber } from "@/lib/formatNumber";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { AxiosError } from "axios";

export default function RequestWithdrawal() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [bank, setBank] = useState("");
  const [iban, setIban] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swift, setSwift] = useState("");
  const t = useTranslations("supplier.withdrawal");
  const locale = useLocale();

  const { data: withdrawalAmount } = useQuery({
    queryKey: ["withdrawal-amount", id],
    queryFn: async () => {
      const response = await api.get(`/api/suppliers/${id}/withdrawal-amount`);
      return response?.data?.totalAmount;
    },
  });
  // console.log("withdrawalAmount", withdrawalAmount);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/suppliers/request-funds`, {
        bidId: id,
        amount: withdrawalAmount,
        bankName: bank,
        iban,
        accountNumber,
        swift,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const fallbackMessage = t("success");
      const displayMessage =
        locale === "sv"
          ? data?.messageSv || fallbackMessage
          : data.message || fallbackMessage;
      toast.success(displayMessage);

      router.push("/supplier/earnings");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<ErrorResponse, any>) =>
      handleMutationError(error, locale),
  });

  return (
    <div className="p-6 ">
      {/* Header */}
      <div className="flex items-center justify-start w-screen mb-8">
        <button onClick={() => router.back()} className="p-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold ml-4">{t("title")}</h1>
      </div>

      {/* Available Balance */}
      <div className="mb-8 mx-auto flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-2">{t("availableBalance")}</p>
        <h2 className="text-4xl font-bold">
          {formatNumber(withdrawalAmount)} SEK
        </h2>
      </div>

      {/* Form */}
      <div className="space-y-6 w-full md:w-1/2 mx-auto">
        <div>
          <label className="text-gray-600 mb-2 block">
            {t("amountToWithdraw")}
          </label>
          <input
            type="text"
            value={withdrawalAmount}
            disabled
            placeholder="SEK80,000"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-gray-600 mb-2 block">{t("selectBank")}</label>
          <input
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="Nordea"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-gray-600 mb-2 block">{t("iban")}</label>
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="97644684643269867428087"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-gray-600 mb-2 block">{t("accountNumber")}</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="123456789"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-gray-600 mb-2 block">{t("swift")}</label>
          <input
            type="text"
            value={swift}
            onChange={(e) => setSwift(e.target.value)}
            placeholder="BUKBGB22"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <p className="text-gray-500 text-sm mt-4">{t("note")}</p>

        <button
          className="w-full bg-red-500 text-white py-4 rounded-full text-lg font-semibold mt-8"
          onClick={() => {
            // Handle withdrawal request
            if (!withdrawalAmount || !bank || !iban || !accountNumber || !swift) {
              toast.error(t("fillAllFields"));
              return;
            }
            mutation.mutate();
          }}
        >
          {mutation.isPending ? t("requesting") : t("requestWithdrawal")}
        </button>
      </div>
    </div>
  );
}
