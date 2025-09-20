/* eslint-disable @typescript-eslint/no-unused-vars */
import { Quotation } from "@/api/interfaces/admin/quotations";

export const extractMoveDetails = (quotation: Quotation) => {
  if (!quotation) return ""; // Return an empty object if no quotation is provided
  const {
    created_at,
    from_city,
    to_city,
    id: quotationId,
    email_address,
    phone_number,
    status,
    type,
    type_of_service,
    move_date,
    ...moveDetails
  } = quotation;
  return moveDetails;
};
