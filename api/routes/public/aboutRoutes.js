const express = require('express');
const router = express.Router();
const aboutController = require('../../controller/aboutController');
const { protect, authorize } = require('../../middlewares/auth');

// Routes publiques
router.get('/', aboutController.getAbout);

// Routes protégées (admin seulement)
router.put('/', protect, authorize('admin'), aboutController.updateAbout);

module.exports = router; 