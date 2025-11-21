const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const axios = require("axios");

module.exports.generateTicketPDF = async (ticket, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margins: { top: 40, bottom: 40, left: 40, right: 40 }
            });

            const pageWidth = doc.page.width;
            let y = 40;

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=ticket-${ticket.id}.pdf`
            );

            doc.pipe(res);

            // ---------------- QR CODE ----------------
            const qrPayload = {
                ticket_id: ticket.id,
                user: ticket.user,
                event: ticket.event,
                seats: ticket.seats,
                base_price: ticket.base_price,
                gst: ticket.gst,
                total_price: ticket.total_price,
                createdAt: ticket.createdAt,
            };

            const qrDataURL = await QRCode.toDataURL(JSON.stringify(qrPayload), {
                errorCorrectionLevel: "H",
                margin: 1,
                scale: 10,
            });

            const qrImageBuffer = Buffer.from(
                qrDataURL.replace(/^data:image\/png;base64,/, ""),
                "base64"
            );

            const qrSize = 140;

            // ---------------- TITLE ----------------
            doc.fontSize(26).text("Event Ticket", {
                align: "center"
            });
            y += 40;

            // ---------------- EVENT IMAGE ----------------
            if (ticket.event.image_url) {
                try {
                    const img = await axios.get(ticket.event.image_url, {
                        responseType: "arraybuffer",
                    });

                    doc.image(img.data, 40, y, {
                        width: 180,
                        height: 180,
                        align: "center"
                    });

                    y += 190;
                } catch (e) {
                    console.log("Image failed:", e.message);
                }
            }

            // ---------------- EVENT DETAILS ----------------
            doc.fontSize(18).text(ticket.event.title, 40, y);
            y += 25;

            doc.fontSize(12).text(`Description: ${ticket.event.description}`, 40, y, {
                width: pageWidth - 80
            });
            y += 40;

            doc.text(
                `Event Date: ${new Date(ticket.event.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}`,
                40,
                y
            );
            y += 20;

            doc.text(`Event Time: ${ticket.event.time}`, 40, y);
            y += 35;

            // ---------------- USER DETAILS ----------------
            doc.fontSize(14).text("Customer Details", 40, y);
            y += 20;

            doc.fontSize(12).text(`Name: ${ticket.user.username}`, 40, y);
            y += 18;

            doc.text(`Email: ${ticket.user.email}`, 40, y);
            y += 30;

            // ---------------- TICKET DETAILS ----------------
            doc.fontSize(14).text("Ticket Details", 40, y);
            y += 20;

            doc.fontSize(12).text(`Ticket ID: ${ticket.id}`, 40, y); y += 18;
            doc.text(`Seats: ${ticket.seats.join(", ")}`, 40, y); y += 18;
            doc.text(`Base Price: Rs.${ticket.base_price} /-`, 40, y); y += 18;
            doc.text(`GST (18%): Rs.${ticket.gst} /-`, 40, y); y += 18;
            doc.text(`Total Paid: Rs.${ticket.total_price} /-`, 40, y); y += 18;

            doc.text(
                `Booked on: ${new Date(ticket.createdAt).toLocaleString()}`,
                40,
                y
            );
            y += 40;

            // ---------------- QR CODE CENTER ----------------
            const qrX = (pageWidth - qrSize) / 2;

            doc.fontSize(14).text("Scan QR for Ticket Verification:", qrX - 20, y);
            y += 20;

            doc.image(qrImageBuffer, qrX, y, {
                width: qrSize,
                height: qrSize
            });

            // END PDF
            doc.end();
            doc.on("finish", resolve);
            doc.on("error", reject);

        } catch (err) {
            reject(err);
        }
    });
};
