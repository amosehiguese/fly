import { Bid } from "./bids";
import { Quotation } from "./quotations";

export interface QuotationBidsResponse {
  message: string;
  data: { quotation: Quotation; bids: Bid[] };
}
