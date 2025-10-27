const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const router = express.Router();

// Key Vault setup
const vaultName = process.env.KEY_VAULT_NAME || "kv-taskGen-2";
const keyVaultUrl = `https://${vaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyVaultUrl, credential);

// Constant-time string comparison
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

    // Fetch user password from Key Vault
    let userSecret;
    try {
      userSecret = await secretClient.getSecret(`${username}pass`);
    } catch (err) {
      if (err.statusCode === 404 || err.code === "SecretNotFound") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Key Vault error:", err);
      return res.status(500).json({ error: "Error accessing Key Vault", detail: err.message });
    }

    // Check password
    const match = safeCompare(userSecret.value, password);
    if (!match) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Fetch JWT secret
    let jwtSecret;
    try {
      const secret = await secretClient.getSecret("jwtsecret");
      jwtSecret = secret.value;
    } catch (err) {
      console.error("JWT secret error:", err);
      return res.status(500).json({ error: "Error fetching JWT secret" });
    }

    // Generate JWT
    const token = jwt.sign({ username }, jwtSecret, { expiresIn: "1h" });

    return res.status(200).json({ username, token });
  } catch (ex) {
    console.error("Unhandled error in login:", ex);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
