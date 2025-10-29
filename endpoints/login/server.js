const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const router = express.Router();

// Key Vault setup
const vaultName = process.env.KEY_VAULT_NAME || "kv-taskgen-dev";
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
    console.log("🔹 Login attempt:", username);

    if (typeof username !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ error: "Username and password must be strings" });
    }

    // Get user password from Key Vault
    let userSecret;
    try {
      userSecret = await secretClient.getSecret(`${username}pass`);
    } catch (err) {
      if (err.statusCode === 404 || err.code === "SecretNotFound") {
        console.warn(`❌ User not found: ${username}`);
        return res.status(404).json({ error: "User not found" });
      }
      console.error("🔴 Key Vault error:", err.message);
      return res
        .status(500)
        .json({ error: "Error accessing Key Vault", detail: err.message });
    }

    if (!safeCompare(userSecret.value, password)) {
      console.warn(`⚠️ Invalid password for: ${username}`);
      return res.status(401).json({ error: "Invalid password" });
    }

    // Get JWT secret from Key Vault
    const jwtSecret = (await secretClient.getSecret("jwtsecret")).value;

    // Sign JWT
    const token = jwt.sign({ username }, jwtSecret, { expiresIn: "1h" });

    console.log(`✅ Login success for user: ${username}`);
    return res.json({ username, token });
  } catch (ex) {
    console.error("💥 Unhandled error in /login:", ex);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

