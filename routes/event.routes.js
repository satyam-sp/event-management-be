// routes/event.routes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public access
router.get('/', eventController.findAllEvents);
router.get('/:id', eventController.findEventById);

// Admin-only access
router.post('/', [verifyToken, isAdmin], eventController.createEvent); // Includes seat generation
router.put('/:id', [verifyToken, isAdmin], eventController.updateEvent);
router.delete('/:id', [verifyToken, isAdmin], eventController.deleteEvent);

module.exports = router;