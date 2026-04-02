const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc   Get dashboard stats
// @route  GET /api/admin/stats
// @access Private/Admin
const getStats = async (req, res, next) => {
    try {
        const [totalUsers, totalBookings, totalServices, paidBookings] = await Promise.all([
            User.countDocuments(),
            Booking.countDocuments(),
            Service.countDocuments({ isActive: true }),
            Booking.find({ paymentStatus: 'paid' }),
        ]);

        const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

        // Aggregate Monthly Revenue (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    total: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Aggregate Bookings by Category
        const categoryStats = await Booking.aggregate([
            {
                $lookup: {
                    from: 'services',
                    localField: 'service',
                    foreignField: '_id',
                    as: 'serviceDetails'
                }
            },
            { $unwind: '$serviceDetails' },
            {
                $group: {
                    _id: '$serviceDetails.category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentBookings = await Booking.find()
            .populate('user', 'name email')
            .populate('service', 'title category')
            .sort('-createdAt')
            .limit(10);

        res.json({
            success: true,
            stats: { 
                totalUsers, 
                totalBookings, 
                totalServices, 
                totalRevenue, 
                monthlyRevenue: monthlyRevenue.map(m => ({ 
                    name: `${m._id.month}/${m._id.year}`, 
                    total: m.total 
                })),
                categoryStats: categoryStats.map(c => ({ 
                    name: c._id, 
                    value: c.count 
                }))
            },
            recentBookings,
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all users
// @route  GET /api/admin/users
// @access Private/Admin
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort('-createdAt');
        res.json({ success: true, users });
    } catch (error) {
        next(error);
    }
};

// @desc   Update user role
// @route  PUT /api/admin/users/:id/role
// @access Private/Admin
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStats, getAllUsers, updateUserRole };
