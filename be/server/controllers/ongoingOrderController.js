const db = require("../../db/connect");
const { authenticateJWT, userIsLoggedIn, supplierIsLoggedIn } = require("../controllers/loginController/authMiddleware");






exports.customerOngoingOrders = [
  authenticateJWT, userIsLoggedIn,
  async (req, res) => {
    const customer_email = req.user.email;
    const { bid_id } = req.params;

    if (!bid_id) {
      return res.status(400).json({
        error: "Bid ID is required."
      });
    }

    try {
      // First verify bid ownership
      const ownershipQuery = `
        SELECT b.quotation_type, b.quotation_id 
        FROM bids b
        JOIN (
          SELECT 'company_relocation' AS type, id, email_address FROM company_relocation WHERE email_address = ?
          UNION ALL
          SELECT 'move_out_cleaning', id, email_address FROM move_out_cleaning WHERE email_address = ?
          UNION ALL
          SELECT 'storage', id, email_address FROM storage WHERE email_address = ?
          UNION ALL
          SELECT 'heavy_lifting', id, email_address FROM heavy_lifting WHERE email_address = ?
          UNION ALL
          SELECT 'carrying_assistance', id, email_address FROM carrying_assistance WHERE email_address = ?
          UNION ALL
          SELECT 'junk_removal', id, email_address FROM junk_removal WHERE email_address = ?
          UNION ALL
          SELECT 'estate_clearance', id, email_address FROM estate_clearance WHERE email_address = ?
          UNION ALL
          SELECT 'evacuation_move', id, email_address FROM evacuation_move WHERE email_address = ?
          UNION ALL
          SELECT 'private_move', id, email_address FROM private_move WHERE email_address = ?
          UNION ALL
          SELECT 'moving_service', id, email_address FROM moving_service WHERE email_address = ?
        ) q ON b.quotation_id = q.id AND b.quotation_type = q.type
        WHERE b.id = ?
      `;

      const [ownership] = await new Promise((resolve, reject) => {
        db.query(ownershipQuery, [
          customer_email, customer_email, customer_email,
          customer_email, customer_email, customer_email,
          customer_email, customer_email, customer_email,
          customer_email, bid_id
        ], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!ownership) {
        return res.status(403).json({
          error: "Unauthorized: This bid does not belong to you"
        });
      }

      // If ownership verified, get full details
      const detailsQuery = `
        SELECT 
          b.id AS bid_id,
          b.total_price,
          b.order_status,
          b.payment_method,
          b.payment_status,
          s.company_name AS supplier_name,
          s.phone AS supplier_phone,
          s.email AS supplier_email,
          q.*,
          CASE 
            WHEN q.type = 'moving_service' THEN
              JSON_OBJECT(
                'type', q.type_of_service,
                'label', CASE 
                  WHEN JSON_CONTAINS(q.type_of_service, '"local_move"', '$') THEN 'Local Move'
                  WHEN JSON_CONTAINS(q.type_of_service, '"moving_abroad"', '$') THEN 'Moving Abroad'
                  WHEN JSON_CONTAINS(q.type_of_service, '"long_distance_move"', '$') THEN 'Long Distance Move'
                  ELSE q.type_of_service
                END
              )
            ELSE 
              JSON_OBJECT(
                'type', q.type_of_service,
                'label', q.type_of_service
              )
          END as service_type
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        JOIN (
          SELECT id, 'company_relocation' AS type, type_of_service, from_city, to_city, move_date FROM ${ownership.quotation_type}
          WHERE id = ?
        ) q ON b.quotation_id = q.id
        WHERE b.id = ?
      `;

      const [result] = await new Promise((resolve, reject) => {
        db.query(detailsQuery, [ownership.quotation_id, bid_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!result) {
        return res.status(404).json({
          error: "Order details not found"
        });
      }

      const response = {
        bid_id: result.bid_id,
        total_price: result.total_price,
        status: result.order_status,
        payment_method: result.payment_method,
        payment_status: result.payment_status,
        supplier_name: result.supplier_name,
        supplier_phone: result.supplier_phone,
        supplier_email: result.supplier_email,
        from_city: result.from_city,
        to_city: result.to_city,
        move_date: result.move_date ? new Date(result.move_date).toISOString() : null,
        service_type: typeof result.service_type === 'string' ? 
          JSON.parse(result.service_type) : 
          result.service_type,
        service_details: result.type === 'moving_service' ? {
          type: result.type_of_service,
          description: result.description || null
        } : result.type_of_service
      };

      return res.status(200).json({
        data: response
      });

    } catch (error) {
      console.error("Error fetching ongoing order:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to fetch ongoing order"
      });
    }
  }
];

exports.supplierOngoingOrders = [
  authenticateJWT, supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    const { bid_id } = req.params;

    if (!bid_id) {
      return res.status(400).json({
        error: "Bid ID is required."
      });
    }

    try {
      const query = `
        SELECT 
          b.id AS bid_id,
          b.total_price,
          b.order_status,
          b.payment_method,
          b.payment_status,
          c.fullname AS customer_name,
          c.phone_num AS customer_phone,
          c.email AS customer_email,
          q.*,
          CASE 
            WHEN q.type = 'local_move' THEN 'Local Move'
            WHEN q.type = 'moving_abroad' THEN 'Moving Abroad'
            WHEN q.type = 'long_distance_move' THEN 'Long Distance Move'
            ELSE q.type
          END as service_label
        FROM bids b
        JOIN (
          SELECT 
            id, 
            'company_relocation' AS type, 
            type_of_service,
            from_city, 
            to_city, 
            move_date, 
            email_address 
          FROM company_relocation
          UNION ALL
          SELECT id, 'move_out_cleaning', type_of_service, from_city, to_city, move_date, email_address FROM move_out_cleaning
          UNION ALL
          SELECT id, 'storage', type_of_service, from_city, to_city, move_date, email_address FROM storage
          UNION ALL
          SELECT id, 'heavy_lifting', type_of_service, from_city, to_city, move_date, email_address FROM heavy_lifting
          UNION ALL
          SELECT id, 'carrying_assistance', type_of_service, from_city, to_city, move_date, email_address FROM carrying_assistance
          UNION ALL
          SELECT id, 'junk_removal', type_of_service, from_city, to_city, move_date, email_address FROM junk_removal
          UNION ALL
          SELECT id, 'estate_clearance', type_of_service, from_city, to_city, move_date, email_address FROM estate_clearance
          UNION ALL
          SELECT id, 'evacuation_move', type_of_service, from_city, to_city, move_date, email_address FROM evacuation_move
          UNION ALL
          SELECT id, 'private_move', type_of_service, from_city, to_city, move_date, email_address FROM private_move
          UNION ALL
          SELECT 
            id,
            'local_move' AS type,
            type_of_service,
            from_city,
            to_city,
            move_date,
            email_address
          FROM moving_service 
          WHERE JSON_CONTAINS(type_of_service, '"local_move"', '$')
          UNION ALL
          SELECT 
            id,
            'long_distance_move' AS type,
            type_of_service,
            from_city,
            to_city,
            move_date,
            email_address
          FROM moving_service
          WHERE JSON_CONTAINS(type_of_service, '"long_distance_move"', '$')
          UNION ALL
          SELECT 
            id,
            'moving_abroad' AS type,
            type_of_service,
            from_city,
            to_city,
            move_date,
            email_address
          FROM moving_service
          WHERE JSON_CONTAINS(type_of_service, '"moving_abroad"', '$')
        ) q ON b.quotation_id = q.id AND b.quotation_type = q.type
        JOIN customers c ON q.email_address = c.email
        WHERE b.id = ? 
        AND b.supplier_id = ?
        AND b.status = 'accepted'
      `;

      const [result] = await new Promise((resolve, reject) => {
        db.query(query, [bid_id, supplier_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!result) {
        return res.status(403).json({
          error: "Unauthorized access or order not found"
        });
      }

      const response = {
        bid_id: result.bid_id,
        total_price: result.total_price,
        status: result.order_status,
        payment_method: result.payment_method,
        payment_status: result.payment_status,
        customer_name: result.customer_name,
        customer_phone: result.customer_phone,
        customer_email: result.customer_email,
        from_city: result.from_city,
        to_city: result.to_city,
        move_date: result.move_date ? new Date(result.move_date).toISOString() : null,
        type: result.type,
        service_label: result.service_label,
        type_of_service: result.type_of_service
      };

      return res.status(200).json({
        data: response
      });

    } catch (error) {
      console.error("Error fetching ongoing order:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to fetch ongoing order"
      });
    }
  }
];