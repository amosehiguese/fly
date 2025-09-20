const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const notificationService = require("../../../utils/notificationService");
const emailService = require("../../../utils/emailService");
const { format, differenceInCalendarMonths, addMonths } = require("date-fns");
const { check, validationResult } = require("express-validator");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../../controllers/loginController/authMiddleware");
const invoiceService = require("../../../utils/invoiceService");
const path = require("path");

exports.acceptBid = [
  checkRole(["super_admin", "finance_admin"]),
  async (req, res) => {
    const {
      bid_id,
      moving_price_percentage,
      additional_service_percentage,
      truck_cost_percentage,
    } = req.body;

    if (
      !bid_id ||
      moving_price_percentage === undefined ||
      additional_service_percentage === undefined ||
      truck_cost_percentage === undefined
    ) {
      return res.status(400).json({
        error:
          "Bid ID, moving price percentage, additional service percentage, and truck cost percentage are required.",
      });
    }

    if (
      isNaN(moving_price_percentage) ||
      isNaN(additional_service_percentage) ||
      isNaN(truck_cost_percentage)
    ) {
      return res.status(400).json({
        error: "Percentages must be valid numbers.",
      });
    }

    const connection = await db.promise().getConnection();

    try {
      await connection.beginTransaction();

      const [bids] = await connection.query(
        `SELECT bids.*, suppliers.email AS supplier_email 
         FROM bids 
         JOIN suppliers ON bids.supplier_id = suppliers.id 
         WHERE bids.id = ? AND bids.status = 'pending'`,
        [bid_id]
      );

      if (bids.length === 0) {
        throw { status: 404, message: "Bid not found or already processed." };
      }

      const bid = bids[0];

      let quotation;
      if (
        bid.quotation_type === "company_relocation" ||
        bid.quotation_type === "moving_cleaning" ||
        bid.quotation_type === "estate_clearance"
      ) {
        const [quotationDetails] = await connection.query(
          `SELECT name AS first_name, name AS last_name, ssn, email, pickup_address, delivery_address 
           FROM ${bid.quotation_type} WHERE id = ?`,
          [bid.quotation_id]
        );

        if (quotationDetails.length === 0) {
          throw { status: 404, message: "Quotation details not found." };
        }

        quotation = {
          ...quotationDetails[0],
          extra_insurance: 0,
          rut_discount: 0,
        };
      } else {
        const [quotationDetails] = await connection.query(
          `SELECT name, ssn, email, pickup_address, delivery_address, extra_insurance, rut_discount 
           FROM ${bid.quotation_type} WHERE id = ?`,
          [bid.quotation_id]
        );

        if (quotationDetails.length === 0) {
          throw { status: 404, message: "Quotation details not found." };
        }

        quotation = quotationDetails[0];
      }

      const movingCostWithCommission =
        parseFloat(bid.moving_cost) * (1 + moving_price_percentage / 100);
      const additionalServiceWithCommission =
        (bid.additional_service ? parseFloat(bid.additional_service) : 0) *
        (1 + additional_service_percentage / 100);
      const truckCostWithCommission =
        (bid.truck_cost ? parseFloat(bid.truck_cost) : 0) *
        (1 + truck_cost_percentage / 100);

      const rutBase =
        movingCostWithCommission + additionalServiceWithCommission;
      const rutDeduction = quotation.rut_discount ? rutBase * 0.5 : 0;

      let finalPrice;
      let initialPayment;
      let remainingPayment;

      if (quotation.rut_discount) {
        // Deduct RUT from moving + additional, then add truck cost
        finalPrice = Math.round(
          rutBase - rutDeduction + truckCostWithCommission
        );

        initialPayment =
          (rutBase - rutDeduction + truckCostWithCommission) * 0.2;
        remainingPayment =
          (rutBase - rutDeduction + truckCostWithCommission) * 0.8;
      } else {
        // No deduction, just sum all
        finalPrice = Math.round(rutBase + truckCostWithCommission);

        initialPayment = finalPrice * 0.2;
        remainingPayment = finalPrice * 0.8;
      }

      await connection.query(
        `INSERT INTO accepted_bids (
            order_id, bid_id, supplier_id, quotation_id, quotation_type, 
            moving_price_percentage, additional_service_percentage, truck_cost,
            final_price, initial_payment, remaining_payment, 
            payment_status, order_status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'awaiting_initial_payment', 'accepted', NOW())`,
        [
          bid.order_id,
          bid_id,
          bid.supplier_id,
          bid.quotation_id,
          bid.quotation_type,
          moving_price_percentage,
          additional_service_percentage,
          truck_cost_percentage,
          finalPrice,
          initialPayment,
          remainingPayment,
        ]
      );

      await connection.query(
        `UPDATE bids SET status = 'rejected' WHERE quotation_id = ? AND quotation_type = ? AND id != ? AND status = 'pending'`,
        [bid.quotation_id, bid.quotation_type, bid_id]
      );

      const [rejectedBids] = await connection.query(
        `SELECT b.*, s.email AS supplier_email 
         FROM bids b
         JOIN suppliers s ON b.supplier_id = s.id
         WHERE b.quotation_id = ? 
         AND b.quotation_type = ? 
         AND b.id != ? 
         AND b.status = 'rejected'`,
        [bid.quotation_id, bid.quotation_type, bid_id]
      );

      for (const rejectedBid of rejectedBids) {
        await emailService.sendEmail(rejectedBid.supplier_email || "", {
          subject: `Uppdatering om ditt bud för ${rejectedBid.quotation_type}`,
          html: `<p>Ditt bud på tjänsten har blivit avslaget. Tack för att du deltog.</p>`,
        });
      }

      await connection.query(
        `UPDATE bids SET status = 'approved' WHERE id = ?`,
        [bid_id]
      );

      await connection.query(
        `UPDATE ${bid.quotation_type} SET status = 'awarded' WHERE id = ?`,
        [bid.quotation_id]
      );

      // await emailService.sendEmail(bid.supplier_email || "", {
      //   subject: `bud för ${bid.quotation_type} har accepterats`,
      //   html: `<p>Grattis! Ditt bud har accepterats. Order-ID:${
      //     bid.order_id
      //   }. Slutpris: ${supplierTotalBid.toFixed(2)} SEK</p>`,
      // });

      const invoiceData = {
        order_id: bid.order_id,
        bid_id: bid_id,
        customer_name: `${quotation.first_name || ""} ${
          quotation.last_name || ""
        }`.trim(),
        customer_email: quotation.email || "",
        ssn: quotation.ssn || "",
        service_description: "Flyttjänst – Faktura",
        amount: finalPrice,
        initial_payment: initialPayment,
        remaining_payment: remainingPayment,
        from_city: quotation.pickup_address || "",
        to_city: quotation.delivery_address || "",
        move_date: bid.estimated_completion_date || "",
        insurance_cost: quotation.extra_insurance ? 249 : 0,
        tax_deduction: rutDeduction,
        services: [
          {
            description: "Flyttkostnad",
            quantity: 1,
            unit_price: movingCostWithCommission,
          },
          {
            description: "Lastbilskostnad",
            quantity: 1,
            unit_price: truckCostWithCommission,
          },
          {
            description: "Tilläggstjänster",
            quantity: 1,
            unit_price: additionalServiceWithCommission,
          },
        ],
      };

      // If you want to show RUT deduction as a line item on the invoice:
      // if (quotation.rut_discount) {
      //   invoiceData.services.push({
      //     description: "RUT-avdrag",
      //     quantity: 1,
      //     unit_price: -rutDeduction,
      //   });
      // }

      const invoicePath = await invoiceService.generateInvoice(invoiceData);

      await emailService.sendEmail(
        quotation.email,
        emailService.templates.invoiceEmail({
          invoiceNumber: bid.order_id,
          orderId: bid.order_id,
          bidId: bid_id,
          customerName: `${quotation.first_name || ""} ${
            quotation.last_name || ""
          }`.trim(),
          ssn: quotation.ssn,
          service: bid.quotation_type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          fromCity: quotation.pickup_address || "",
          toCity: quotation.delivery_address || "",
          moveDate: bid.estimated_completion_date
            ? new Date(bid.estimated_completion_date).toLocaleDateString(
                "sv-SE"
              )
            : "",
          movingCost: movingCostWithCommission,
          truckCost: truckCostWithCommission,
          additionalServices: additionalServiceWithCommission,
          insuranceCost: quotation.extra_insurance ? 249 : 0,
          totalAmount: finalPrice,
          taxDeduction: rutDeduction,
          initialPayment: initialPayment,
          remainingPayment: remainingPayment,
        }),
        [
          {
            filename: `invoice-${bid.order_id}.pdf`,
            path: invoicePath,
            contentType: "application/pdf",
          },
          {
            filename: "flyttman-logo.png",
            path: path.join(
              __dirname,
              "../../../public/images/flyttman-logo.png"
            ),
            cid: "company-logo",
          },
        ]
      );

      await connection.commit();
      connection.release();

      res.status(200).json({
        message:
          "Budet godkändes framgångsrikt! Ett fakturamejl har skickats till kunden.",
        finalPrice,
        requiresInitialPayment: true,
        initialPaymentAmount: initialPayment,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error in accepting bid:", error);
      res.status(error.status || 500).json({
        error: error.message || "Internal Server Error",
      });
    }
  },
];
