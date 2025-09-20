const fs = require("fs");
const path = require("path");
const emailService = require("./emailService");

// Test data with RUT
const testDataWithRUT = {
  invoiceNumber: "INV-1001",
  orderId: "ORD-1001",
  bidId: "BID-1001",
  customerName: "Anna Andersson",
  ssn: "850101-1234",
  service: "Flytt",
  fromCity: "Stockholm",
  toCity: "Göteborg",
  moveDate: "2025-08-01",
  movingCost: 15600,
  truckCost: 11700,
  additionalServices: 0,
  insuranceCost: 249,
  totalAmount: 27300,
  taxDeduction: 7800, // RUT
  initialPayment: 3900,
  remainingPayment: 15600,
};

// Test data without RUT
const testDataNoRUT = {
  ...testDataWithRUT,
  invoiceNumber: "INV-1002",
  taxDeduction: 0,
  initialPayment: 1560,
  remainingPayment: 6240,
};

function saveHtmlToFile(html, filename) {
  fs.writeFileSync(path.join(__dirname, filename), html, "utf8");
  console.log(`Saved: ${filename}`);
}

function testInvoiceEmail(data, filename) {
  const { subject, html } = emailService.templates.invoiceEmail(data);
  saveHtmlToFile(html, filename);
  console.log("Subject:", subject);
}

// Run tests
testInvoiceEmail(testDataWithRUT, "invoice-with-rut.html");
testInvoiceEmail(testDataNoRUT, "invoice-no-rut.html");