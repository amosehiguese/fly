export interface CompletedWithdrawal {
  withdrawal_id: number;
  reference: string;
  amount: string;
  bank_name: string;
  iban: string;
  request_date: string;
  paid_date: string;
  status: string;
  supplier_name: string;
  supplier_email: string;
}

export interface PendingWithdrawal {
  withdrawal_id: number;
  reference: string;
  amount: string;
  bank_name: string;
  iban: string;
  request_date: string;
  status: string;
  supplier_name: string;
  supplier_email: string;
}

export interface WithdrawalResponse {
  message: string;
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  data: CompletedWithdrawal[] | PendingWithdrawal[];
}

export interface FundsOverviewResponse {
  message: string;
  data: {
    money_in: string;
    money_paid_out: string;
    total_money: string;
    ready_for_disbursement: string;
    total_withdrawal_requests: string;
  };
}
