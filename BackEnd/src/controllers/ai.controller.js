const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const response = await aiService(language || "unknown", code);
    return res.status(200).send(response);
  } catch (error) {
    console.error("Error generating review:", error.message);
    return res.status(500).json({
      error: "Failed to generate code review",
      details: error.message,
    });
  }
};