const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    checkIn: {
        type: Date,
        required: [true, 'Дата заезда обязательна'],
    },
    checkOut: {
        type: Date,
        required: [true, 'Дата выезда обязательна'],
    },
    guests: {
        type: Number,
        default: 1,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid',
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'kaspi', 'halyk', null],
        default: null,
    },
    paymentTransactionId: {
        type: String,
        default: null,
    },
    specialRequests: {
        type: String,
        maxlength: [500, 'Примечание не может быть длиннее 500 символов'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
