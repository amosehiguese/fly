const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

/**
 * Generate a professional PDF invoice
 * @param {Object} data - Invoice details
 * @returns {Promise<string>} - Path to the generated invoice PDF
 */
const generateInvoice = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const invoiceDir = path.join(__dirname, "../uploads/customer-invoice");
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      const invoicePath = path.join(invoiceDir, `Faktura-${data.order_id}.pdf`);
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const writeStream = fs.createWriteStream(invoicePath);
      doc.pipe(writeStream);

      // Colors
      const primaryColor = "#33658a";
      const secondaryColor = "#86bbd8";
      const accentColor = "#2f4858";
      const textColor = "#333333";

      doc.fillColor(textColor);

      const formatCurrency = (amount) =>
        new Intl.NumberFormat("sv-SE", {
          style: "currency",
          currency: "SEK",
          minimumFractionDigits: 2,
        }).format(amount);

      const logoPath = path.join(
        __dirname,
        "../public/images/flyttman-logo.png"
      );

      // Header
      doc
        .image(logoPath, 50, 35, { width: 120 })
        .fontSize(10)
        .font("Helvetica");

      doc
        .fontSize(10)
        .text("Flyttman (Goomove AB)", 400, 45, { align: "right" })
        .text("St. Johannes g. 2,", { align: "right" })
        .text("211 46 Malmö.", { align: "right" })
        .text("support@flyttman.se", { align: "right" })
        .text("www.flyttman.se", { align: "right" })
        .text("VAT: SE559097673301", { align: "right" });

      doc
        .strokeColor(secondaryColor)
        .lineWidth(1)
        .moveTo(50, 115)
        .lineTo(550, 115)
        .stroke();

      // Title
      doc
        .moveDown(1.5)
        .fontSize(20)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Faktura", { align: "center" })
        .moveDown(1.5);

      // Customer Info
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(primaryColor)
        .text("Kund:", 50, 180);

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(textColor)
        .text(data.customer_name, 50, 200)
        .text(data.customer_email);

      if (data.ssn) {
        doc.text(`SSN: ${data.ssn}`);
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(primaryColor)
        .text("Datum:", 350, 180);

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(textColor)
        .text(`Datum: ${new Date().toLocaleDateString("sv-SE")}`, 350, 200)
        .text(
          `Förfallodatum: ${new Date(
            Date.now() + 7 * 86400000
          ).toLocaleDateString("sv-SE")}`
        );

      // Service Info
      doc
        .moveDown(1)
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(primaryColor)
        .text("Tjänster:");

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(textColor)
        .text(`Tjänst: ${data.service_description}`);

      if (data.from_city) doc.text(`Från: ${data.from_city}`);
      if (data.to_city) doc.text(`Till: ${data.to_city}`);
      if (data.move_date)
        doc.text(
          `Flyttdatum: ${new Date(data.move_date).toLocaleDateString("sv-SE")}`
        );

      doc.moveDown(1.5);

      // Include insurance if applicable — MUST happen before mapping
      const baseServices = [...data.services];

      if (data.insurance_cost && data.insurance_cost > 0) {
        baseServices.push({
          description: "Extra försäkring",
          quantity: 1,
          unit_price: data.insurance_cost,
        });
      }

      const updatedServices = baseServices.map((s) => {
        const desc = s.description.toLowerCase();
        if (desc === "flyttkostnad") s.description = "Flytt";
        else if (desc === "tilläggstjänster") s.description = "Övriga tjänster";
        else if (desc === "lastbilskostnad") s.description = "Lastbil";
        return s;
      });

      let tableTop = doc.y;

      const drawServiceSection = (services) => {
        if (!services.length) return;

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(primaryColor)
          .text("BESKRIVNING", 50, tableTop)
          .text("ANTAL", 250, tableTop, { width: 90, align: "center" })
          .text("PRIS ", 340, tableTop, { width: 100, align: "right" })
          .text("BELOPP", 440, tableTop, { width: 100, align: "right" });

        tableTop += 15;

        doc
          .strokeColor(accentColor)
          .lineWidth(1)
          .moveTo(50, tableTop)
          .lineTo(550, tableTop)
          .stroke();

        tableTop += 10;

        services.forEach((s) => {
          doc
            .font("Helvetica")
            .fillColor(textColor)
            .text(s.description, 50, tableTop)
            .text(`${s.quantity}`, 250, tableTop, {
              width: 90,
              align: "center",
            })
            .text(formatCurrency(s.unit_price), 340, tableTop, {
              width: 100,
              align: "right",
            })
            .text(formatCurrency(s.unit_price * s.quantity), 440, tableTop, {
              width: 100,
              align: "right",
            });
          tableTop += 18;
        });

        tableTop += 12;
      };

      drawServiceSection(updatedServices);

      const grossAmount = updatedServices.reduce(
        (acc, s) => acc + s.unit_price * s.quantity,
        0
      );

      doc
        .font("Helvetica")
        .fillColor(textColor)
        .text("Totalt:", 340, tableTop, { width: 100, align: "right" })
        .text(formatCurrency(grossAmount), 440, tableTop, {
          width: 100,
          align: "right",
        });

      if (data.tax_deduction) {
        tableTop += 16;
        doc
          .text("- RUT-avdrag -50%", 340, tableTop, {
            width: 100,
            align: "right",
          })
          .text(`- ${formatCurrency(data.tax_deduction)}`, 440, tableTop, {
            width: 100,
            align: "right",
          });
      }

      const netAmount = grossAmount - data.tax_deduction;

      tableTop += 20;
      doc
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("Att betala:", 340, tableTop, {
          width: 100,
          align: "right",
        })
        .text(formatCurrency(netAmount), 440, tableTop, {
          width: 100,
          align: "right",
        });

      tableTop += 20;
      doc
        .font("Helvetica-Bold")
        .fillColor(textColor)
        .text("Boka betala = 20%", 340, tableTop)
        .font("Helvetica-Bold")
        .text(formatCurrency(data.initial_payment), 440, tableTop, {
          align: "right",
        });

      tableTop += 18;
      doc
        .font("Helvetica")
        .fillColor(textColor)
        .text("Att betala vid leverans", 340, tableTop)
        .text(formatCurrency(data.remaining_payment), 440, tableTop, {
          align: "right",
        });

      // Payment Info
      tableTop += 35;
      doc
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("BETALNINGSINSTRUKTIONER:", 50, tableTop);

      tableTop += 20;
      doc
        .font("Helvetica")
        .fillColor(textColor)
        .text("BANKGIRO: 5480-7516", 50, tableTop)
        .text("SWISH: 1234698353", 50, tableTop + 15)
        .text(
          "Referens: Vänligen inkludera fakturanumret i din betalningsreferens",
          50,
          tableTop + 30
        );

      // Footer
      const footerY = doc.page.height - 100;

      doc
        .strokeColor(secondaryColor)
        .lineWidth(1)
        .moveTo(50, footerY)
        .lineTo(550, footerY)
        .stroke();

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "Ange faktura nummer vid betalning. Gör en del betalning på 20% för att bekräfta bokningen.",
          50,
          footerY + 15,
          { align: "center" }
        )
        .text(
          "Om du har några frågor angående denna faktura, vänligen kontakta support@flyttman.se",
          { align: "center" }
        );

      doc.end();

      writeStream.on("finish", () => resolve(invoicePath));
      writeStream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
