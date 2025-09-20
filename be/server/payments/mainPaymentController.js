const paymentService = require('./paymentController');

exports.customerPayment = async (req, res) => {
  try {
    const { bid_id, customer_email, payment_method_id } = req.body;

    if (!bid_id || !customer_email || !payment_method_id) {
      return res.status(400).json({
        error: "Bid ID, customer email, and payment method ID are required.",
      });
    }

    const bid = await paymentService.getBidDetails(bid_id);
    
    try {
      const amountInOre = paymentService.validatePayment(bid, customer_email);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInOre,
        currency: "sek",
        payment_method: payment_method_id,
        confirm: true,
        description: `Payment for ${bid.quotation_type} bid #${bid.bid_id}`,
        receipt_email: bid.quotation_customer_email,
        metadata: {
          bid_id: bid.bid_id,
          quotation_type: bid.quotation_type,
          supplier_email: bid.supplier_email,
        },
      });

      await paymentService.updatePaymentStatus(bid_id, 'processing', paymentIntent.id);

      return res.status(200).json({
        message: "Payment initiated successfully.",
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: amountInOre / 100,
      });

    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ 
      error: "Internal Server Error.",
      details: error.message 
    });
  }
};