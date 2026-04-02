const Booking = require('../models/Booking');
const crypto = require('crypto');

// @desc   Process payment (simulation)
// @route  POST /api/payments/pay
// @access Private
const processPayment = async (req, res, next) => {
    try {
        const { bookingId, paymentMethod, cardNumber, cardHolder, expiry, cvv } = req.body;

        const booking = await Booking.findById(bookingId).populate('service', 'title');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Бронирование не найдено' });
        }

        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Нет доступа' });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Бронирование уже оплачено' });
        }

        // Simulate payment processing delay and validation
        if (paymentMethod === 'card') {
            if (!cardNumber || !cardHolder || !expiry || !cvv) {
                return res.status(400).json({ success: false, message: 'Заполните все поля карты' });
            }
            const cleanCard = cardNumber.replace(/\s/g, '');
            if (cleanCard.length < 16) {
                return res.status(400).json({ success: false, message: 'Неверный номер карты' });
            }
            // Simulate declined card (for demo: card ending in 0000)
            if (cleanCard.endsWith('0000')) {
                return res.status(402).json({ success: false, message: 'Карта отклонена. Недостаточно средств.' });
            }
        }

        // Generate fake transaction ID
        const transactionId = 'TXN-' + crypto.randomBytes(8).toString('hex').toUpperCase();

        // Simulate 95% success rate
        const isSuccessful = Math.random() > 0.05;

        if (!isSuccessful) {
            return res.status(402).json({ success: false, message: 'Ошибка платежа. Попробуйте ещё раз.' });
        }

        booking.paymentStatus = 'paid';
        booking.paymentMethod = paymentMethod;
        booking.paymentTransactionId = transactionId;
        booking.status = 'confirmed';
        await booking.save();

        res.json({
            success: true,
            message: 'Оплата прошла успешно!',
            transactionId,
            amount: booking.totalPrice,
            booking,
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get payment status for a booking
// @route  GET /api/payments/:bookingId
// @access Private
const getPaymentStatus = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.bookingId).populate('service', 'title');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Бронирование не найдено' });
        }

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Нет доступа' });
        }

        res.json({
            success: true,
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            transactionId: booking.paymentTransactionId,
            amount: booking.totalPrice,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { processPayment, getPaymentStatus };
