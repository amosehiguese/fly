"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/api";
import { useFetchMyOrderById } from "@/hooks/customer/useFetchMyOrders";
import { formatNumber } from "@/lib/formatNumber";
import { Suspense } from "react";
// Separate component that uses useSearchParams

function RateOrderContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { data: order } = useFetchMyOrderById(orderId || "");

  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        rating: rating,
        feedback_text: review,
        order_id: orderId || "",
      };

      const response = await api.post("api/reviews/submit", body);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["user-dashboard"] });
      router.push("/customer/orders");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        error.response.data.error ||
          error.response.data.message ||
          error.message ||
          "Failed to submit review"
      );
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="max-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft strokeWidth={3} className="w-8 h-8 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold">Leave Review</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Order Info */}
        <div className="flex items-center gap-3 sm:gap-4 mb-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
          <div className="bg-black rounded-full p-3 sm:p-4 shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-white flex items-center justify-center">
              📦
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl font-semibold truncate">
              Order ID: {order?.order_id}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 truncate">
              {order?.supplier_name}
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              SEK {formatNumber(Number(order?.final_price))}
            </p>
          </div>
          <span className="shrink-0 px-3 py-1 text-sm capitalize bg-green-100 text-green-600 rounded-full">
            {order?.order_status}
          </span>
        </div>

        {/* Rating Section */}
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
              How was your Move?
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              Rate the move
            </p>
            <div className="flex justify-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 p-1 sm:p-2"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 sm:w-12 sm:h-12",
                      star <= (hoveredStar || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-base sm:text-lg font-medium">
              Add detailed review
            </label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Enter here"
              className="min-h-[120px] sm:min-h-[150px] text-sm sm:text-base resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4">
            <Button
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50 text-sm sm:text-base py-2 sm:py-3"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base py-2 sm:py-3"
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function RateOrder() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RateOrderContent />
    </Suspense>
  );
}
