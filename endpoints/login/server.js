// routes/login.js
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const router = express.Router();

const vaultName = process.env.KEY_VAULT_NAME || "kv-taskGen-2";
const keyVaultUrl = `https://${vaultName}.vault.azure.net`;

const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyVaultUrl, credential);

// Safe string compare
function safeCompare(a, b) {
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "username and password are required as strings" });
    }

    // Get the user's password from Key Vault
    let userSecret;
    try {
      userSecret = await secretClient.getSecret(`${username}pass`);
    } catch (err) {
      if (err.statusCode === 404 || err.code === "SecretNotFound") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error(err);
      return res.status(500).json({ error: "Key Vault error" });
    }

    if (!safeCompare(userSecret.value, password)) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Get JWT secret from Key Vault
    const jwtSecret = (await secretClient.getSecret("jwtsecret")).value;

    // Create JWT with username
    const token = jwt.sign({ username }, jwtSecret, { expiresIn: "1h" });

    return res.json({ username, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
