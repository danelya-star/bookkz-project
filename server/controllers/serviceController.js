const Service = require('../models/Service');
const Booking = require('../models/Booking');

// @desc   Get all services with filtering/searching/pagination
// @route  GET /api/services
// @access Public
const getServices = async (req, res, next) => {
    try {
        const { category, minPrice, maxPrice, search, checkIn, checkOut, page = 1, limit = 9, sort = '-createdAt' } = req.query;

        const filter = { isActive: true };

        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$text = { $search: search };
        }

        // Availability filter
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);

            // Find services that HAVE overlapping bookings
            const busyBookings = await Booking.find({
                status: { $in: ['pending', 'confirmed'] },
                $or: [
                    { checkIn: { $lt: end }, checkOut: { $gt: start } }
                ]
            }).select('service');

            const busyServiceIds = busyBookings.map(b => b.service);
            filter._id = { $nin: busyServiceIds };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Service.countDocuments(filter);
        const services = await Service.find(filter).sort(sort).skip(skip).limit(Number(limit));

        res.json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            services,
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get single service
// @route  GET /api/services/:id
// @access Public
const getServiceById = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service || !service.isActive) {
            return res.status(404).json({ success: false, message: 'Услуга не найдена' });
        }
        res.json({ success: true, service });
    } catch (error) {
        next(error);
    }
};

// @desc   Create service (admin)
// @route  POST /api/services
// @access Private/Admin
const createService = async (req, res, next) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, service });
    } catch (error) {
        next(error);
    }
};

// @desc   Update service (admin)
// @route  PUT /api/services/:id
// @access Private/Admin
const updateService = async (req, res, next) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            return res.status(404).json({ success: false, message: 'Услуга не найдена' });
        }
        res.json({ success: true, service });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete service (admin - soft delete)
// @route  DELETE /api/services/:id
// @access Private/Admin
const deleteService = async (req, res, next) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!service) {
            return res.status(404).json({ success: false, message: 'Услуга не найдена' });
        }
        res.json({ success: true, message: 'Услуга успешно удалена' });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all services for admin (including inactive)
// @route  GET /api/services/admin/all
// @access Private/Admin
const getAdminServices = async (req, res, next) => {
    try {
        const services = await Service.find().sort('-createdAt');
        res.json({ success: true, services });
    } catch (error) {
        next(error);
    }
};

// @desc   Get service availability (booked dates)
// @route  GET /api/services/:id/availability
// @access Public
const getServiceAvailability = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            service: req.params.id,
            status: { $in: ['pending', 'confirmed'] },
            checkOut: { $gte: new Date() }
        }).select('checkIn checkOut');

        res.json({ success: true, bookedDates: bookings });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getServices, 
    getServiceById, 
    createService, 
    updateService, 
    deleteService, 
    getAdminServices, 
    getServiceAvailability 
};
