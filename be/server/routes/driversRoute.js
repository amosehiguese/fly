const express = require("express");
const router = express.Router();
const routerRegister = require("../controllers/drivers/driversRegister");
const {
  orderDetailsDetailed,
  getDriverOrders,
} = require("../controllers/drivers/driverOrders");
const { orderUpdate } = require("../controllers/drivers/orderUpdate");
const proofOfDelivery = require("../controllers/drivers/proofOfDelivery");
const {
  getDriverProfile,
  getAssignedSupplier,
} = require("../controllers/drivers/driverProfile");
const {
  authenticateJWT,
  supplierIsLoggedIn,
  driverIsLoggedIn,
} = require("../controllers/loginController/authMiddleware");

const { editDriverProfile } = require("../controllers/drivers/driverEdit");

router.post(
  "/register",
  authenticateJWT,
  supplierIsLoggedIn,
  routerRegister.driversRegister
);

// drivers getting their orders
router.get(
  "/order/:orderId",
  authenticateJWT,
  driverIsLoggedIn,
  orderDetailsDetailed
);
router.get("/orders", authenticateJWT, driverIsLoggedIn, getDriverOrders);

// drivers updating their order status
router.post("/order/update", authenticateJWT, driverIsLoggedIn, orderUpdate);

router.post(
  "/proof-of-delivery/:orderId",
  authenticateJWT,
  driverIsLoggedIn,
  proofOfDelivery.proofOfDelivery
);

router.get("/profile", authenticateJWT, driverIsLoggedIn, getDriverProfile);

router.get(
  "/assigned-supplier",
  authenticateJWT,
  driverIsLoggedIn,
  getAssignedSupplier
);

router.put(
  "/edit",
  authenticateJWT,
  driverIsLoggedIn,
  editDriverProfile
);

module.exports = router;
