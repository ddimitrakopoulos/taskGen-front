const express = require("express");
const router = express.Router();

// Define routes on router
router.post("/", async (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
