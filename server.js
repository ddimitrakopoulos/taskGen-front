// server.js
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const loginRouter = require("./routes/login");

const app = express();
const port = process.env.PORT || 8080;

// Needed to parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/login", loginRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
