const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../../db/connect");

const getBidDetailsQuery = `
  SELECT 
    b.id AS bid_id, 
    b.bid_price, 
    b.total_price, 
    b.payment_status,
    b.payment_method,
    b.requires_payment_method,
    b.quotation_type,
    b.quotation_id,
    s.company_name AS supplier_name, 
    s.email AS supplier_email,
    CASE b.quotation_type
      WHEN 'company_relocation' THEN cr.email_address
      WHEN 'move_out_cleaning' THEN mc.email_address
      WHEN 'storage' THEN st.email_address
      WHEN 'heavy_lifting' THEN hl.email_address
      WHEN 'carrying_assistance' THEN ca.email_address
      WHEN 'junk_removal' THEN jr.email_address
      WHEN 'estate_clearance' THEN ec.email_address
      WHEN 'evacuation_move' THEN em.email_address
      WHEN 'privacy_move' THEN pm.email_address
      WHEN 'local_move' THEN ms.email_address
      WHEN 'long_distance_move' THEN ms.email_address
      WHEN 'moving_abroad' THEN ms.email_address
    END AS quotation_customer_email
  FROM bids b
  JOIN suppliers s ON b.supplier_id = s.id
  LEFT JOIN moving_service ms ON b.quotation_id = ms.id 
    AND b.quotation_type IN ('local_move', 'long_distance_move', 'moving_abroad')
  LEFT JOIN company_relocation cr ON b.quotation_id = cr.id 
    AND b.quotation_type = 'company_relocation'
  LEFT JOIN move_out_cleaning mc ON b.quotation_id = mc.id 
    AND b.quotation_type = 'move_out_cleaning'
  LEFT JOIN storage st ON b.quotation_id = st.id 
    AND b.quotation_type = 'storage'
  LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id 
    AND b.quotation_type = 'heavy_lifting'
  LEFT JOIN carrying_assistance ca ON b.quotation_id = ca.id 
    AND b.quotation_type = 'carrying_assistance'
  LEFT JOIN junk_removal jr ON b.quotation_id = jr.id 
    AND b.quotation_type = 'junk_removal'
  LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id 
    AND b.quotation_type = 'estate_clearance'
  LEFT JOIN evacuation_move em ON b.quotation_id = em.id 
    AND b.quotation_type = 'evacuation_move'
  LEFT JOIN privacy_move pm ON b.quotation_id = pm.id 
    AND b.quotation_type = 'privacy_move'
  WHERE b.id = ?
`;

const getBidDetails = async (bid_id) => {
  const [bid] = await new Promise((resolve, reject) => {
    db.query(getBidDetailsQuery, [bid_id], (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
  return bid;
};

const validatePayment = (bid, customer_email) => {
  if (!bid) throw new Error("Bid not found.");
  if (!bid.payment_status) throw new Error("Payment status is missing");
  if (bid.payment_status.trim().toLowerCase() !== "pending") {
    throw new Error("Payment already completed or in process.");
  }
  if (!bid.quotation_customer_email) {
    throw new Error("Customer email not found for this quotation");
  }
  if (customer_email.toLowerCase() !== bid.quotation_customer_email.toLowerCase()) {
    throw new Error("Unauthorized: Email does not match quotation customer.");
  }

  const amountInOre = Math.round(bid.total_price * 100);
  if (amountInOre < 50) throw new Error("Amount must be at least 0.50 SEK.");

  return amountInOre;
};

const updatePaymentStatus = async (bid_id, status, payment_intent_id = null) => {
  const query = `
    UPDATE bids 
    SET 
      payment_status = ?,
      ${payment_intent_id ? 'payment_intent_id = ?,' : ''}
      updated_at = NOW()
    WHERE id = ?
  `;

  const params = payment_intent_id 
    ? [status, payment_intent_id, bid_id]
    : [status, bid_id];

  await new Promise((resolve, reject) => {
    db.query(query, params, (err) => err ? reject(err) : resolve());
  });
};

module.exports = {
  getBidDetails,
  validatePayment,
  updatePaymentStatus,
  getBidDetailsQuery
};