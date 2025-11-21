// controllers/event.controller.js
const db = require('../models');
const Event = db.Event;
const Seat = db.Seat;
const { sequelize } = db;

// Requires isAdmin middleware
exports.createEvent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, date, time, location, video_url,image_url, total_seats } = req.body;

    if (total_seats <= 0) {
      await t.rollback();
      return res.status(400).send({ message: 'Total seats must be greater than zero.' });
    }

    // 1. Create the Event
    const event = await Event.create({
      title, description, date, time, location, video_url, total_seats, image_url
    }, { transaction: t });

    // 2. Bulk Create Seat records
    const seatsToCreate = [];
    for (let i = 1; i <= total_seats; i++) {
      seatsToCreate.push({
        event_id: event.id,
        seat_number: `S-${i}`,
        is_booked: false,
      });
    }
    await Seat.bulkCreate(seatsToCreate, { transaction: t });

    await t.commit();
    res.status(201).send({ message: 'Event and seats created successfully!', event });

  } catch (error) {
    await t.rollback();
    res.status(500).send({ message: error.message });
  }
};

exports.findAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        { 
          model: Seat, 
          as: "seats",                // <<< REQUIRED
          attributes: ["id", "seat_number", "is_booked", "price"] 
        },
      ],
    });

    res.status(200).send(events);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// ===============================
// GET EVENT BY ID
// ===============================
exports.findEventById = async (req, res) => {
  try {
    const id = req.params.id;

    const event = await Event.findOne({
      where: { id },
      include: [
        { 
          model: Seat, 
          as: "seats",                // <<< REQUIRED
          attributes: ["id", "seat_number", "is_booked","price"] 
        },
      ],
      order: [[{ model: Seat, as: "seats" }, 'id', 'ASC']]

    });

    if (!event) return res.status(404).send({ message: 'Event not found.' });

    res.status(200).send(event);

  } catch (error) {
    console.log(error)
    res.status(500).send({ message: error.message });
  }
};

// ===============================
// UPDATE EVENT
// ===============================
exports.updateEvent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { title, description, date, time, location, video_url,image_url, total_seats } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      await t.rollback();
      return res.status(404).send({ message: 'Event not found.' });
    }

    // If total seats changed → recreate seats
    if (total_seats && total_seats !== event.total_seats) {
      // Delete all old seats
      await Seat.destroy({ where: { event_id: id }, transaction: t });

      // Create new seats
      const seatsToCreate = [];
      for (let i = 1; i <= total_seats; i++) {
        seatsToCreate.push({
          event_id: id,
          seat_number: `S-${i}`,
          is_booked: false
        });
      }
      await Seat.bulkCreate(seatsToCreate, { transaction: t });
    }

    // Update event fields
    await event.update({
      title, description, date, time, location, video_url, total_seats,image_url
    }, { transaction: t });

    await t.commit();
    res.status(200).send({ message: 'Event updated successfully!', event });

  } catch (error) {
    await t.rollback();
    res.status(500).send({ message: error.message });
  }
};

// ===============================
// DELETE EVENT
// ===============================
exports.deleteEvent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;

    const event = await Event.findByPk(id);
    if (!event) {
      await t.rollback();
      return res.status(404).send({ message: 'Event not found.' });
    }

    // Delete seats
    await Seat.destroy({ where: { event_id: id }, transaction: t });

    // Delete event
    await event.destroy({ transaction: t });

    await t.commit();
    res.status(200).send({ message: 'Event deleted successfully!' });

  } catch (error) {
    await t.rollback();
    res.status(500).send({ message: error.message });
  }
};

// Add other CRUD exports (findAll, findOne, update, delete) here...