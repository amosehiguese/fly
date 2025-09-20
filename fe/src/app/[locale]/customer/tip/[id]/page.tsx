"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TipSlider from "@/components/ui/tip-slider";
import { useMutation } from "@tanstack/react-query";
import api, { ErrorResponse, handleMutationError } from "@/api";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface TipRequest {
  amount: number;
  message: string;
}

interface TipResponse {
  success: boolean;
  clientSecret: string;
  message: string;
  messageSv: string;
}

export default function TipPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const t = useTranslations("customers.tip");
  const locale = useLocale();

  const [rating, setRating] = useState(4);
  const [review, setReview] = useState("");
  const [tipAmount, setTipAmount] = useState(15);

  // Tip mutation
  const tipMutation = useMutation<TipResponse, Error, TipRequest>({
    mutationFn: async (data: TipRequest) => {
      const response = await api.post(`tipping/order/${orderId}/tip`, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(t("tipSentSuccessfully"));
      // Handle payment flow with clientSecret if needed
      console.log("Client secret:", data.clientSecret);
      router.push("api/customer/orders");
    },
    onError: (error) =>
      handleMutationError(error as AxiosError<ErrorResponse>, locale),
  });

  const handleSubmit = () => {
    if (!review.trim()) {
      toast.error(t("pleaseAddReview"));
      return;
    }

    tipMutation.mutate({
      amount: tipAmount,
      message: review,
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="relative w-full max-w-[600px] mx-auto min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-[#373737]" />
        </button>
        <h1 className="text-lg font-bold text-[#373737]">{t("leaveReview")}</h1>
        <div className="w-8"></div>
      </div>

      {/* Driver Profile */}
      <div className="flex flex-col items-center mt-8">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
          <Image
            src="/avatar_male.jpg"
            alt="Driver"
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>
        <h2 className="text-xl font-semibold text-[#373737] mt-4">Collin FW</h2>
        <p className="text-xs text-[#373737CC] text-center px-6 mt-2 leading-relaxed">
          {t("driverDescription")}
        </p>
      </div>

      {/* Rating and Review Section */}
      <div className="px-4 mt-12">
        <div className="flex flex-col items-center mb-8">
          {/* Rate the move */}
          <div className="text-center mb-2">
            <h3 className="text-lg text-black font-normal">
              {t("rateTheMove")}
            </h3>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? "fill-[#FFD700] text-[#FFD700]"
                      : "fill-none text-[#707070] stroke-[#707070]"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#373737] mb-1">
            {t("addDetailedReview")}
          </label>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={t("enterHere")}
            className="w-full h-24 p-3 border border-[#707070] rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#EC1B25] focus:border-transparent"
            maxLength={500}
          />
        </div>
      </div>

      {/* Tip Section */}
      <div className="px-4 mb-24">
        <h3 className="text-lg text-black font-normal text-center mb-6">
          {t("tipYourDriver")}
        </h3>

        {/* Current Amount Display */}
        <div className="text-center mb-8">
          <div className="text-3xl font-normal text-black">SEK {tipAmount}</div>
        </div>

        {/* Interactive Tip Slider */}
        <div className="mb-8">
          <TipSlider
            value={tipAmount}
            min={5}
            max={500}
            step={5}
            onChange={setTipAmount}
            className="px-4"
          />
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className=" w-full max-w-[500px] bg-white border-t border-gray-200 px-10 py-6">
        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            disabled={tipMutation.isPending}
            className="flex-1 bg-[#EC1B25] hover:bg-[#EC1B25]/90 text-white font-semibold py-3 rounded-lg"
          >
            {tipMutation.isPending ? t("submitting") : t("submit")}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={tipMutation.isPending}
            className="flex-1 border-[#EC1B25] text-[#EC1B25] hover:bg-[#EC1B25]/5 font-semibold py-3 rounded-lg"
          >
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
