const express = require('express');
const router = express.Router();
const {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getAdminServices,
    getServiceAvailability,
} = require('../controllers/serviceController');
const { addReview, getServiceReviews } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getServices);
router.get('/admin/all', protect, adminOnly, getAdminServices);
router.get('/:id', getServiceById);
router.get('/:id/availability', getServiceAvailability);

// Review routes
router.get('/:id/reviews', getServiceReviews);
router.post('/:id/reviews', protect, addReview);

router.post('/', protect, adminOnly, createService);
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;
