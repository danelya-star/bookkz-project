const express = require('express');
const router = express.Router();
const { processPayment, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/pay', protect, processPayment);
router.get('/:bookingId', protect, getPaymentStatus);

module.exports = router;
