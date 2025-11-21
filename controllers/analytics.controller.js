const db = require("../models");
const { Ticket, Event, sequelize } = db;

// -----------------------------
// INTERNAL FUNCTION (NO req/res)
// -----------------------------
async function getDashboardStatsInternal() {

    const totalEvents = await Event.count();
    const totalTickets = await Ticket.count();
    const totalRevenue = await Ticket.sum("total_price");

    const eventWiseTickets = await Ticket.findAll({
        attributes: [
            [sequelize.col("Ticket.event_id"), "event_id"],
            [sequelize.fn("COUNT", sequelize.col("Ticket.id")), "ticketCount"]
        ],
        include: [
            {
                model: Event,
                as: "event",
                attributes: ["id", "title"]
            }
        ],
        group: ["Ticket.event_id", "event.id"],
        order: [["event_id", "ASC"]]
    });

    const monthlyRevenue = await Ticket.findAll({
        attributes: [
            [
                sequelize.fn("DATE_TRUNC", "month", sequelize.col("createdAt")),
                "month"
            ],
            [sequelize.fn("SUM", sequelize.col("total_price")), "revenue"]
        ],
        group: ["month"],
        order: [[sequelize.literal("month"), "ASC"]]
    });

    return {
        totalEvents,
        totalTickets,
        totalRevenue,
        eventWiseTickets,
        monthlyRevenue
    };
}

// Export internal function for manual usage
exports.getDashboardStatsInternal = getDashboardStatsInternal;


// -------------------------------------------
// API FUNCTION → Calls the internal function
// -------------------------------------------
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await getDashboardStatsInternal();
        return res.json(stats);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
