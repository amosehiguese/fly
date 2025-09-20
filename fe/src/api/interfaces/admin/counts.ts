export interface DashboardCountsResponse {
  data: DashboardCounts;
}

export interface DashboardCounts {
  conversations: Conversations;
  bids: Bids;
  quotations: Quotations;
  quotationsAndBids: QuotationsAndBids;
}

export interface Conversations {
  total: number;
}

export interface Bids {
  total: number;
  pending: string;
  accepted: string;
  rejected: string;
}

export interface Quotations {
  total: number;
  awarded: number;
  open: number;
}

export interface QuotationsAndBids {
  total: number;
}
