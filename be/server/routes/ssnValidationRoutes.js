const express = require('express');
const router = express.Router();
const { validateAndUpdateRUT } = require('../controllers/ssnValidationController');

router.post('/validate-rut', validateAndUpdateRUT);

module.exports = router;