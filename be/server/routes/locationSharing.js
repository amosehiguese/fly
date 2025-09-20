const express = require('express');
const router = express.Router();
const { driverLongAndLat } = require('../controllers/drivers/sharingDistance');
const {
  authenticateJWT,
  supplierIsLoggedIn,
  driverIsLoggedIn,
} = require("../controllers/loginController/authMiddleware");
const { getDriverLocations } = require('../controllers/drivers/sharingDistance');


// Driver routes for location sharing
router.post('/share-location', authenticateJWT, driverIsLoggedIn, driverLongAndLat);

// Supplier routes for viewing driver locations
router.get('/driver-locations', authenticateJWT, supplierIsLoggedIn, getDriverLocations);


module.exports = router;