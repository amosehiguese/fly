const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');


router.post('/submit', reviewController.submitReview);
router.get('/get-reviews', reviewController.getReview);


module.exports = router; 