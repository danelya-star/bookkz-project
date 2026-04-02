const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc   Create booking
// @route  POST /api/bookings
// @access Private
const createBooking = async (req, res, next) => {
    try {
        const { serviceId, checkIn, checkOut, guests, specialRequests } = req.body;

        const service = await Service.findById(serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({ success: false, message: 'Услуга не найдена' });
        }

        // Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
            service: serviceId,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({ 
                success: false, 
                message: 'Извините, эти даты уже забронированы. Пожалуйста, выберите другие даты.' 
            });
        }

        // Calculate total price (days × price per night)
        const msPerDay = 1000 * 60 * 60 * 24;
        const days = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / msPerDay));
        const totalPrice = days * service.price * (guests || 1);

        const booking = await Booking.create({
            user: req.user.id,
            service: serviceId,
            checkIn,
            checkOut,
            guests: guests || 1,
            totalPrice,
            specialRequests,
        });

        await booking.populate('service', 'title category location image price');

        res.status(201).json({ success: true, booking });
    } catch (error) {
        next(error);
    }
};

// @desc   Get user's bookings
// @route  GET /api/bookings/my
// @access Private
const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('service', 'title category location image price currency')
            .sort('-createdAt');

        res.json({ success: true, bookings });
    } catch (error) {
        next(error);
    }
};

// @desc   Get single booking
// @route  GET /api/bookings/:id
// @access Private
const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('service', 'title category location image price currency amenities')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Бронирование не найдено' });
        }

        // Only admin or booking owner can view
        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Нет доступа' });
        }

        res.json({ success: true, booking });
    } catch (error) {
        next(error);
    }
};

// @desc   Cancel booking
// @route  PUT /api/bookings/:id/cancel
// @access Private
const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Бронирование не найдено' });
        }

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Нет доступа' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Бронирование уже отменено' });
        }

        booking.status = 'cancelled';
        if (booking.paymentStatus === 'paid') {
            booking.paymentStatus = 'refunded';
        }
        await booking.save();

        res.json({ success: true, booking, message: 'Бронирование отменено' });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all bookings (admin)
// @route  GET /api/bookings/admin
// @access Private/Admin
const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate('service', 'title category')
            .populate('user', 'name email')
            .sort('-createdAt');

        res.json({ success: true, bookings });
    } catch (error) {
        next(error);
    }
};

module.exports = { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings };
