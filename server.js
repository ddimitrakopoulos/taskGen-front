const express = require("express");
const path = require("path");
const fs = require("fs");

const api_login = require("./endpoints/login/server.js");
const api_table = require("./endpoints/table/server.js");

const app = express();
app.use(express.json());

// Serve static frontend if available
const distPath = path.join(__dirname, "frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Attach routers
app.use("/api/login", api_login);
app.use("/api/tasks", api_table);

// Catch-all for SPA routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

