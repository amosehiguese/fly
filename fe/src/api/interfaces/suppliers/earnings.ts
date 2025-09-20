export interface MonthlyEarning {
  month: string;
  monthly_earnings: number;
}

export interface SupplierEarnings {
  totalEarnings: {
    pending: string;
    completed: string;
  };
  totalTransactions: {
    pending: number;
    completed: number;
  };
  monthlyEarnings: MonthlyEarning[];
}

export interface SupplierEarningsResponse {
  message: string;
  data: SupplierEarnings;
}
