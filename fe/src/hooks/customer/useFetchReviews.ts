import api from "@/api";
import { useQuery } from "@tanstack/react-query";

export interface Review {
  review_id: number;
  order_id: string;
  bid_id: number;
  quotation_type: string;
  supplier_id: number;
  supplier_name: string;
  customer_id: number;
  rating: number;
  feedback_text: string;
  created_at: string;
}

export interface ReviewResponse {
  reviews: Review[];
  total_reviews: number;
}

export const useFetchReviews = () => {
  const { data, isPending, error } = useQuery<ReviewResponse>({
    queryKey: ["customer-reviews"],
    queryFn: async () => {
      const response = await api.get("api/reviews/get-reviews");
      return response.data;
    },
  });

  return { data, isPending, error };
};
