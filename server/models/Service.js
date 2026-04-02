const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Название услуги обязательно'],
        trim: true,
        maxlength: [100, 'Название не может быть длиннее 100 символов'],
    },
    description: {
        type: String,
        required: [true, 'Описание обязательно'],
        maxlength: [1000, 'Описание не может быть длиннее 1000 символов'],
    },
    category: {
        type: String,
        required: [true, 'Категория обязательна'],
        enum: ['hotel', 'restaurant', 'event', 'transport'],
    },
    price: {
        type: Number,
        required: [true, 'Цена обязательна'],
        min: [0, 'Цена не может быть отрицательной'],
    },
    currency: {
        type: String,
        default: 'KZT',
    },
    location: {
        type: String,
        required: [true, 'Местоположение обязательно'],
    },
    image: {
        type: String,
        default: '',
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
    availableFrom: {
        type: Date,
    },
    availableTo: {
        type: Date,
    },
    capacity: {
        type: Number,
        default: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    amenities: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for search/filter
serviceSchema.index({ category: 1, price: 1, isActive: 1 });
serviceSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
