const Review = require('../models/Review');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// @desc   Add a review to a service
// @route  POST /api/services/:id/reviews
// @access Private
const addReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const serviceId = req.params.id;

        // 1. Check if user has a completed booking for this service
        const hasCompletedBooking = await Booking.findOne({
            user: req.user.id,
            service: serviceId,
            status: 'confirmed', // Consider confirmed bookings as valid for reviews
            paymentStatus: 'paid'
        });

        if (!hasCompletedBooking && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Отзыв можно оставить только после завершения и оплаты бронирования этой услуги' 
            });
        }

        // 2. Check if user already reviewed this service
        const alreadyReviewed = await Review.findOne({
            user: req.user.id,
            service: serviceId
        });

        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'Вы уже оставили отзыв об этой услуге' });
        }

        const review = await Review.create({
            user: req.user.id,
            service: serviceId,
            rating: Number(rating),
            comment
        });

        // 3. Update Service average rating and count
        const reviews = await Review.find({ service: serviceId });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await Service.findByIdAndUpdate(serviceId, {
            rating: avgRating.toFixed(1),
            reviewCount: reviews.length
        });

        const reviewWithUser = await review.populate('user', 'name');

        res.status(201).json({ success: true, review: reviewWithUser });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all reviews for a service
// @route  GET /api/services/:id/reviews
// @access Public
const getServiceReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ service: req.params.id })
            .populate('user', 'name')
            .sort('-createdAt');

        res.json({ success: true, reviews });
    } catch (error) {
        next(error);
    }
};

module.exports = { addReview, getServiceReviews };
