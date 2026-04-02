const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: [true, 'Пожалуйста, поставьте оценку от 1 до 5'],
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: [true, 'Пожалуйста, напишите краткий комментарий'],
        maxlength: [1000, 'Отзыв не может быть длиннее 1000 символов'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// One user can leave only one review per service
reviewSchema.index({ user: 1, service: 1 }, { unique: true });
reviewSchema.index({ service: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
