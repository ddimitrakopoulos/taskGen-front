// endpoints/api1/index.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const randomNum = Math.floor(Math.random() * 100);
  res.json({
    message: "Hello from API 1!",
    randomNum
  });
});

module.exports = router;
