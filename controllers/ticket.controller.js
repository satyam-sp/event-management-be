// controllers/ticket.controller.js
const db = require('../models');
const { Event, Seat, Ticket, sequelize } = db;
const { QueryTypes, Transaction } = require('sequelize');
const { generateTicketPDF } = require('../utils/generatedPDF');

exports.buyTicket = async (req, res) => {
  const { eventId } = req.params;
  const { seats } = req.body; // [seatIds]
  const userId = req.userId || 1; // your authentication logic


  if (!seats || seats.length === 0) {
    return res.status(400).send({ message: "No seats selected" });
  }

  const t = await sequelize.transaction();

  try {
    // Validate & lock seats
    const seatRecords = await Seat.findAll({
      where: { id: seats, event_id: eventId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    console.log(seatRecords, 'fsadff')



    if (seatRecords.length !== seats.length) {
      throw new Error("Some seats are invalid");
    }

    // Check if already booked
    for (const seat of seatRecords) {
      if (seat.is_booked) {
        throw new Error(`Seat ${seat.seat_number} already booked`);
      }
    }

    // Mark seats as booked
    await Seat.update(
      { is_booked: true },
      { where: { id: seats }, transaction: t }
    );

    // Create ONE ticket with multiple seats

    const basePrice = seatRecords.reduce((sum, s) => sum + Number(s.price), 0);

    // 3. Calculate GST (18%)
    const gst = Math.round(basePrice * 0.18);

    // 4. Final total price
    const totalPrice = basePrice + gst;


    console.log(seats, totalPrice, gst, basePrice, '---sdd---')

    const ticket = await Ticket.create(
      {
        event_id: eventId,
        user_id: userId,
        seats, // ARRAY or JSON field
        base_price: basePrice,
        gst: gst,
        total_price: totalPrice
      },
      { transaction: t }
    );

    console.log('CREATE-TICKET----D---')


    await t.commit();
    res.status(200).send({
      message: "Ticket booked successfully",
      ticket,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).send({ message: error.message });
  }
};



// ===============================
// GET ALL TICKETS OF LOGGED-IN USER
// ===============================
exports.findUserTickets = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware

    const tickets = await Ticket.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Event,
          attributes: ['id', 'title', 'date', 'time', 'location']
        },
        {
          model: Seat,
          attributes: ['id', 'seat_number']
        }
      ],
      order: [['purchase_date', 'DESC']]
    });

    if (!tickets.length) {
      return res.status(404).send({ message: "No tickets found for this user." });
    }

    res.status(200).send(tickets);

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


// ===============================
// GET SEAT + EVENT DETAILS BY TICKET ID
// ===============================
exports.findSeatsByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({
      where: { id: ticketId },
      include: [
        {
          model: Seat,
          attributes: ['id', 'seat_number', 'is_booked']
        },
        {
          model: Event,
          attributes: ['id', 'title', 'date', 'time', 'location', 'video_url']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).send({ message: "Ticket not found." });
    }

    res.status(200).send(ticket);

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};



exports.myBookings = async (req, res) => {
  try {
    const userId = req.userId; // get from auth middleware

    const tickets = await db.Ticket.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.Event,
          as: 'event'
        }
      ]
    });


    res.status(200).send({ tickets });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

exports.getTicketDetails = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await db.Ticket.findOne({
      where: { id: ticketId },
      include: [
        { model: db.User, as: "user", attributes: ["id",'username', "email"] },
        { model: db.Event, as: "event", attributes: ["id", "title", "image_url", "description","video_url","date","time"] }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.json(ticket);
  } catch (err) {
    console.error("ERR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.download = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await db.Ticket.findOne({
      where: { id: ticketId },
      include: [
        { model: db.User, as: "user", attributes: ["id",'username', "email"] },
        { model: db.Event, as: "event", attributes: ["id", "title", "image_url", "description","video_url","date", "time"] }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await generateTicketPDF(ticket, res);


  } catch (err) {
    console.error("ERR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};



// Add exports.findUserTickets and exports.findAllSeats(for availability) here...