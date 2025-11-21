const PDFDocument = require("pdfkit");

exports.generateAnalyticsPDF = (stats, res) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=dashboard-report.pdf"
  );

  doc.pipe(res);

  doc.fontSize(22).text("Event Dashboard Report", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(14).text(`Total Events: ${stats.totalEvents}`);
  doc.text(`Total Tickets Sold: ${stats.totalTickets}`);
  doc.text(`Total Revenue: Rs.${stats.totalRevenue}`);
  doc.moveDown(1);

  doc.fontSize(16).text("Event-wise Tickets", { underline: true });
  doc.moveDown(0.5);

  stats.eventWiseTickets.forEach(item => {
    doc.fontSize(12).text(
      `${item.event.title}: ${item.dataValues.ticketCount} tickets`
    );
  });

  doc.moveDown(1);

  doc.fontSize(16).text("Monthly Revenue", { underline: true });
  doc.moveDown(0.5);

  stats.monthlyRevenue.forEach(item => {
    doc.fontSize(12).text(
      `${item.dataValues.month}: Rs.${item.dataValues.revenue}`
    );
  });

  doc.end();
};
