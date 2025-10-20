// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import api1 from "./endpoints/api1/index.js";
import api2 from "./endpoints/api2/index.js";

const app = express();

// Serve frontend built files (Vite build goes into dist/)
app.use(express.static(path.join(__dirname, "frontend/dist")));

// Mount APIs
app.use("/api1", api1);
app.use("/api2", api2);

// For SPA routing fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
