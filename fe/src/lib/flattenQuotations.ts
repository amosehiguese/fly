// import { Quotation } from "@/api/interfaces/admin/quotations";
// import {
//   BaseQuotation,
//   QuotationResults,
// } from "@/api/interfaces/customers/dashboard";

// // First, let's create a type for the flattened array items
// interface FlattenedQuotation extends BaseQuotation {
//   type: keyof QuotationResults;
// }

// // Function to flatten the QuotationResults
// export const flattenQuotations = (
//   quotations: QuotationResults
// ): Quotation[] => {
//   return Object.entries(quotations).flatMap(([type, quotations]) =>
//     quotations?.map((quotation) => ({
//       ...quotation,
//       type: type as keyof QuotationResults,
//     }))
//   );
// };
