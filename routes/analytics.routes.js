const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { generateAnalyticsPDF } = require('../utils/analyticsPDF');


router.get("/stats", [verifyToken, isAdmin],analyticsController.getDashboardStats);

router.get("/download", async (req, res) => {
    const stats = await analyticsController.getDashboardStatsInternal();
  generateAnalyticsPDF(stats, res);
});

module.exports = router;