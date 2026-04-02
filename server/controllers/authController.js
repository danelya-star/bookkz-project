const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
        }

        const user = await User.create({ name, email, password, phone });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Введите email и пароль' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get current user profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @desc   Update user profile
// @route  PUT /api/auth/profile
// @access Private
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone },
            { new: true, runValidators: true }
        );
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @desc   Change password
// @route  PUT /api/auth/password
// @access Private
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Неверный текущий пароль' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Пароль успешно изменён' });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
