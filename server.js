// server.js
const express = require("express");
const path = require("path");

const api_login = require("./endpoints/login/server.js");
const api_table = require("./endpoints/table/server.js");

const app = express();

app.use(express.static(path.join(__dirname, "frontend/dist")));

app.use("/api/login", api_login);
app.use("/api/table", api_table);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
