'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // ---- 1. Insert Events ----
    const events = await queryInterface.bulkInsert(
      'Events',
      [
        {
          title: "ENRIQUE IGLESIAS",
          description: "ENRIQUE IGLESIAS LIVE in Mumbai, India 🇮🇳 | 29 & 30 OCT ‘25 | 60,000 FANS IN 2 SHOWS 🔥",
          date: "2025-12-01",
          time: "10:00 AM",
          location: "Mumbai",
          video_url: 'https://www.youtube.com/watch?v=GPpicDVS1EI',
          image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXbDd8tI6RnzdYSBDlgx6zXCAsnmcrfjhhlw&s',
          total_seats: 100,
          createdAt: now,
          updatedAt: now,
        },
        {
          title: "Radhe Govinda Special | Acyuta Gopi",
          description: "Radhe Govinda Special | Acyuta Gopi Day 1 Final Kirtan | Kirtan Rasa 2023 | Dubai Kirtan Fest",
          date: "2025-12-15",
          time: "06:00 PM",
          location: "dubai",
          video_url: 'https://www.youtube.com/watch?v=vw7mFNsVeY8&list=RDvw7mFNsVeY8&start_radio=1&t=1334s',
          image_url: 'https://media.insider.in/image/upload/c_crop,g_custom/v1755499751/ukrkg1tqqydzyt78xkyl.jpg',
          total_seats: 50,
          createdAt: now,
          updatedAt: now,
        },
      ],
      { returning: true }
    );

    // ⚠️ returning=true does not work on MySQL
    // So we manually fetch event IDs
    const insertedEvents = await queryInterface.sequelize.query(
      `SELECT id, total_seats FROM "Events" ORDER BY id DESC LIMIT 2;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // ---- 2. Create Seat Records ----
    const seats = [];

    insertedEvents.forEach((event) => {
      for (let i = 1; i <= event.total_seats; i++) {
        seats.push({
          event_id: event.id,
          seat_number: `S-${i}`,
          is_booked: false,
          price: 200,
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    await queryInterface.bulkInsert("Seats", seats);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Seats', null, {});
    await queryInterface.bulkDelete('Events', null, {});
  }
};
