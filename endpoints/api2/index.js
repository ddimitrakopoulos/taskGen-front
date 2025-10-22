// endpoints/api2/index.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const randomNum = Math.floor(Math.random() * 1000);
  res.json({
    message: "Hello from API 2!",
    randomNum
  });
});

module.exports = router;
