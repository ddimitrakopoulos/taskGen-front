const express = require("express");
const path = require("path");
const fs = require("fs");

const api_login = require("./endpoints/login/server.js");
const api_table = require("./endpoints/table/server.js");

const app = express();
app.use(express.json());

// ✅ Parse JSON for all incoming requests
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "frontend/dist")));

// API routes
app.use("/api/login", api_login);
app.use("/api/tasks", api_table);

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

