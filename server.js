// server.js
const express = require("express");
const path = require("path");

const api1 = require("./endpoints/api1/index.js");
const api2 = require("./endpoints/api2/index.js");

const app = express();

app.use(express.static(path.join(__dirname, "frontend/dist")));

app.use("/api1", api1);
app.use("/api2", api2);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
