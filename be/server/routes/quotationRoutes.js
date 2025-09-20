const express = require('express');
const router = express();

const quotation = require('../controllers/quotationController')


// post requests
router.post("/company-relocation", quotation.companyRelocation);
router.post("/moving-cleaning", quotation.movingCleaning);
router.post("/heavy-lifting", quotation.heavyLifting);
router.post("/estate-clearance", quotation.estateClearance);
router.post("/evacuation-move", quotation.evacuationMove);
router.post("/private-move", quotation.privateMove);
router.post("/secrecy-move", quotation.secrecyMove);



module.exports = router; 