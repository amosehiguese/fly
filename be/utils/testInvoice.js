const { generateInvoice } = require("./invoiceService");

const testData = {
  order_id: "ORD-2025-001",
  customer_name: "Anna Andersson",
  customer_email: "anna.andersson@example.com",
  ssn: "850101-1234",
  service_description: "Flytt från villa till lägenhet",
  from_city: "Stockholm",
  to_city: "Göteborg",
  move_date: "2025-08-01",
  services: [
    { description: "Flyttkostnad", quantity: 1, unit_price: 15600 },
    { description: "Lastbilskostnad", quantity: 1, unit_price: 11700 },
    { description: "Tilläggstjänster", quantity: 1, unit_price: 0 },
  ],
  movingCost: 15600,
  truckCost: 11700,
  additionalServices: 0,
  rutDeduction: 7800, // Set to 0 to test no RUT
  initialPayment: 3900,
  initial_payment: 3900,
  remaining_payment: 15600,
  tax_deduction: 7800,
  amount: 27300,
};

(async () => {
  try {
    const invoicePath = await generateInvoice(testData);
    console.log("Invoice generated at:", invoicePath);
  } catch (err) {
    console.error("Failed to generate invoice:", err);
  }
})();