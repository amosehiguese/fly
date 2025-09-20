import { OrderFilters } from "@/app/admin/orders/page";
import { Filters as QuotationFilters } from "@/app/admin/quotations/page";
import api from ".";
import {
  BidApprovalRequestBody,
  BidResponse,
  BidsResponse,
} from "./interfaces/admin/bids";
import { DashboardCounts } from "./interfaces/admin/counts";
import {
  QuotationResponse,
  QuotationsResponse,
} from "./interfaces/admin/quotations";
import { RecentActivities } from "./interfaces/admin/recentActivities";
import { formatToSqlDate } from "@/lib/formatToSqlDate";
import { MonthlyIncome } from "./interfaces/admin/monthlyIncome";
import { Admin, AdminRequest } from "./interfaces/admin/admin";
import { BidFilters } from "@/app/admin/quotes-bids/Bids";
import {
  CheckoutResponse,
  OrderResponse,
  OrdersResponse,
} from "./interfaces/admin/order";
import {
  DisputeResponse,
  DisputesResponse,
  DisputeStatus,
} from "./interfaces/admin/disputes";
import { QuotationBidsResponse } from "./interfaces/admin/quotation-bids";
import { DisputeFilters } from "@/app/admin/disputes/page";
import {
  DisputeChat,
  DisputeMessageResponse,
  SendMessageResponse,
} from "./interfaces/admin/chats";
import { AdminSupplierChatResponse } from "./interfaces/admin/supplier-chats";
import {
  SupplierDetailResponse,
  SuppliersResponse,
  UpdateSupplierStatusRequest,
} from "./interfaces/admin/suppliers";
import {
  FundsOverviewResponse,
  WithdrawalResponse,
} from "./interfaces/admin/withdrawal";

export const searchSuppliers = async ({
  companyName,
}: {
  companyName: string;
}) => {
  const response = await api.get(
    `api/admins/search-suppliers?company_name=${companyName}`
  );
  return response.data;
};

export const fetchBids = async (
  currentPage: number,
  searchQuery?: string,
  filters?: BidFilters | undefined
): Promise<BidsResponse> => {
  const params = new URLSearchParams();
  params.append("page", currentPage.toString());
  params.append("status", filters?.orderStatus || "");
  params.append("startDate", formatToSqlDate(filters?.startDate) || "");
  params.append("endDate", formatToSqlDate(filters?.endDate) || "");
  params.append("limit", "10");
  if (searchQuery) {
    params.append("search", searchQuery);
  }

  const response = await api.get(`api/admins/bids?${params.toString()}`);
  return response.data;
};

export const fetchQuotations = async (
  currentPage: number,
  searchQuery?: string,
  filters?: QuotationFilters | undefined
): Promise<QuotationsResponse> => {
  const params = new URLSearchParams();
  params.append("page", currentPage.toString());
  params.append("status", filters?.orderStatus || "");
  params.append("startDate", formatToSqlDate(filters?.startDate) || "");
  params.append("endDate", formatToSqlDate(filters?.endDate) || "");
  params.append("type", filters?.orderType || "");
  params.append("limit", "10");
  if (searchQuery) {
    params.append("search", searchQuery);
  }

  const response = await api.get(`api/admins/quotations?${params.toString()}`);
  return response.data;
};

export const fetchOrders = async (
  currentPage: number,
  searchQuery?: string,
  filters?: OrderFilters | undefined
): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  params.append("page", currentPage.toString());
  params.append("status", filters?.orderStatus || "");
  params.append("date", formatToSqlDate(filters?.date) || "");
  // params.append("endDate", formatToSqlDate(filters?.endDate) || "");
  params.append("type", filters?.quotationType || "");
  params.append("limit", "10");
  if (searchQuery) {
    params.append("location", searchQuery);
  }
  if (searchQuery) {
    params.append("searchQuery", searchQuery);
  }

  const response = await api.get(`api/admins/orders?${params.toString()}`);
  return response.data;
};

export const fetchDisputes = async (
  currentPage: number,
  searchQuery?: string,
  filters?: DisputeFilters | undefined
): Promise<DisputesResponse> => {
  const params = new URLSearchParams();
  params.append("page", currentPage.toString());
  params.append("status", filters?.orderStatus || "");
  params.append("date", formatToSqlDate(filters?.startDate) || "");
  params.append("endDate", formatToSqlDate(filters?.endDate) || "");
  params.append("quotationType", filters?.quotationType || "");
  params.append("limit", "10");
  if (searchQuery) {
    params.append("search", searchQuery);
  }
  if (searchQuery) {
    params.append("searchQuery", searchQuery);
  }
  // http://localhost:3000/api/dispute-chat/admin-disputes/supplier
  const response = await api.get(
    `api/dispute-chat/admin-disputes/supplier?${params.toString()}`
  );
  return response.data;
};

export const fetchDisputeById = async (
  id: string
): Promise<DisputeResponse> => {
  const response = await api.get(`api/admin-dispute/${id}`);
  return response.data;
};

export const updateDispute = async (id: string, status: DisputeStatus) => {
  const response = await api.put(`api/admin-dispute/${id}/status`, { status });
  return response.data;
};

export const fetchDashboardCounts = async (): Promise<DashboardCounts> => {
  const response = await api.get("api/admins/totalcount");
  return response.data.data;
};

export const fetchRecentAcitivities = async (): Promise<RecentActivities[]> => {
  const response = await api.get("api/admins/recent-activities");
  return response.data.activities;
};

export const fetchMonthlyIncome = async (): Promise<MonthlyIncome[]> => {
  const response = await api.get("api/admins/monthly-bids-total");
  return response.data.data;
};

export const fetchAdmins = async (): Promise<Admin[]> => {
  const response = await api.get("api/admins/list");
  return response.data.admins;
};

export const deleteAdmin = async (id: string) => {
  const response = await api.delete(`api/admins/delete/${id}`);
  return response.data;
};

export const createAdmin = async (data: AdminRequest) => {
  const response = await api.post(`api/admins/create`, data);
  return response.data;
};

export const fetchBidById = async (id: string): Promise<BidResponse> => {
  const response = await api.get(`api/admins/bids/${id}`);
  return response.data;
};

export const fetchQuotationById = async (
  id: string,
  type: string
): Promise<QuotationResponse> => {
  const response = await api.get(`api/admins/quotations/${type}/${id}`);
  return response.data;
};

export const fetchQuotationBidsById = async (
  id: string,
  type: string
): Promise<QuotationBidsResponse> => {
  const response = await api.get(`api/admins/quotation-bid/${type}/${id}`);
  return response.data;
};

export const fetchOrderById = async (id: string): Promise<OrderResponse> => {
  const response = await api.get(`api/admins/orders-detailed/${id}`);
  return response.data;
};

export const fetchCheckoutById = async (
  id: string
): Promise<CheckoutResponse> => {
  const response = await api.get(`api/checkout/details/${id}`);
  return response.data;
};

export const approveBid = async (
  data: BidApprovalRequestBody
): Promise<{ bid_id: number; final_price: number; message: string }> => {
  const response = await api.put(`api/admins/bids/${data.bid_id}`, data);
  return response.data;
};

export const updateAutoBid = async (value: boolean) => {
  const response = await api.post(`api/admins/auction/toggle`, {
    auction_enabled: value,
  });
  return response.data;
};

export const fetchCustomerMessages = async (): Promise<DisputeChat[]> => {
  const response = await api.get("api/dispute-chat/admin-disputes/customer");
  return response.data.data;
};

export const fetchSupplierMessages = async (): Promise<DisputeChat[]> => {
  const response = await api.get("api/dispute-chat/admin-disputes/supplier");
  return response.data.data;
};

// export const fetchMessagesByConversationId = async (
//   id: string
// ): Promise<Message[]> => {
//   const response = await api.get(
//     `api/adminmessages/conversations/${id}/messages`
//   );
//   return response.data;
// };

export const fetchAdminCustomerMessages = async (
  id: string
): Promise<DisputeMessageResponse> => {
  const response = await api.get(`api/dispute-chat/admin/${id}/messages`);

  return response.data;
};

export const sendMessage = async (id: number, message: string, file?: File) => {
  const formData = new FormData();
  formData.append("dispute_id", id.toString());
  formData.append("message", message);
  if (file) {
    formData.append("image", file);
  }
  const response = await api.post<SendMessageResponse>(
    `api/dispute-chat/admin/send`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getAdminSupplierMessages = async (
  disputeId: string
): Promise<AdminSupplierChatResponse> => {
  const response = await api.get(
    `api/dispute-supplier-chat/admin/${disputeId}/messages`
  );
  return response.data;
};

export const sendAdminSupplierMessage = async (
  disputeId: string,
  message: string,
  file?: File | null
): Promise<SendMessageResponse> => {
  const formData = new FormData();
  formData.append("dispute_id", disputeId);
  formData.append("message", message);

  if (file) {
    formData.append("image", file);
  }

  const response = await api.post(
    `api/dispute-chat/admin-chat-supplier`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getFixedPercentage = async () => {
  const { data } = await api.get("api/admins/settings/fixed-percentage");
  return data;
};

export const updateFixedPercentage = async (requestBody: {
  moving_cost_percentage: number;
  additional_services_percentage: number;
  cost_of_truck: number;
  auction_duration_minutes: number;
  auction_secondary_duration_minutes: number;
  high_value_bid_threshold: number;
}) => {
  const response = await api.post("api/admins/set-auction", requestBody);
  return response.data;
};

export const fetchSuppliers = async (filters?: {
  company_name?: string;
  reg_status?: string;
  start_date?: string;
  end_date?: string;
}): Promise<SuppliersResponse> => {
  const params = new URLSearchParams();
  if (filters?.company_name)
    params.append("company_name", filters.company_name);
  if (filters?.reg_status) params.append("reg_status", filters.reg_status);
  if (filters?.start_date) params.append("start_date", filters.start_date);
  if (filters?.end_date) params.append("end_date", filters.end_date);

  const response = await api.get(`/api/admins/suppliers?${params.toString()}`);
  return response.data;
};

export const fetchSupplierById = async (
  id: string
): Promise<SupplierDetailResponse> => {
  const response = await api.get(`/api/admins/suppliers/${id}`);
  return response.data;
};

export const updateSupplierStatus = async (
  data: UpdateSupplierStatusRequest
): Promise<{ message: string }> => {
  const response = await api.post("/api/admins/suppliers/approve", data);
  return response.data;
};

export const fetchCompletedWithdrawals = async (
  currentPage: number,
  limit: number
): Promise<WithdrawalResponse> => {
  const response = await api.get(
    `/api/admins/withdrawal-request?page=${currentPage}&limit=${limit}`
  );
  return response.data;
};

export const fetchPendingWithdrawals = async (
  currentPage: number,
  limit: number
): Promise<WithdrawalResponse> => {
  const response = await api.get(
    `/api/admins/pending-withdrawal-request?page=${currentPage}&limit=${limit}`
  );
  return response.data;
};

export const fetchFundsOverview = async (): Promise<FundsOverviewResponse> => {
  const response = await api.get("/api/admins/funds-overview");
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await api.post("/api/admins/request-reset-code", {
    email,
  });
  return response.data;
};

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  const response = await api.post("/api/admins/reset-password", {
    email,
    code,
    newPassword,
  });
  return response.data;
};

export const deleteBid = async (id: string) => {
  const response = await api.delete(`api/admins/bids/${id}`);
  return response.data;
};

export const deleteQuotation = async (id: string, type: string) => {
  const response = await api.delete(`api/admins/quotations/${type}/${id}`);
  return response.data;
};
