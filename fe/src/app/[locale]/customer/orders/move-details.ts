/* eslint-disable @typescript-eslint/no-unused-vars */
import { Quotation } from "@/api/interfaces/admin/quotations";
import { SingleOrder } from "@/api/interfaces/customers/order";

export const extractMoveDetails = (order: SingleOrder) => {
  if (!order) return ""; // Return an empty object if no order is provided
  const {
    created_at,
    from_city,
    order_number,
    type_of_service,
    move_date,
    mover_contact,
    mover_email,
    items,
    delivery_address,
    order_status,
    payment_status,
    ...moveDetails
  } = order;
  return moveDetails;
};
