const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// --- TICKET BUYING ---
// Endpoint for a user to buy a ticket and book a specific seat
// Requires authentication (verifyToken)
router.post('/events/:eventId/buy', [verifyToken], ticketController.buyTicket);

// --- USER TICKETS ---
// Endpoint to view all tickets purchased by the authenticated user
// Requires authentication (verifyToken)
router.get('/my', [verifyToken], ticketController.myBookings);
router.get('/:id', [verifyToken],ticketController.getTicketDetails)
router.get('/:id/download', [verifyToken],ticketController.download)



// --- SEAT AVAILABILITY ---
// Endpoint to view all seats (booked and available) for a specific event
// Public access or simple authentication depending on requirements
router.get('/events/:eventId/seats', ticketController.findSeatsByTicketId);



module.exports = router;