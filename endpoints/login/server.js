const express = require("express");
const crypto = require("crypto");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const router = express.Router();

const vaultName = process.env.KEY_VAULT_NAME || "kv-taskGen-2";
const keyVaultUrl = `https://${vaultName}.vault.azure.net`;

const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyVaultUrl, credential);

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

router.post("/validate", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "username and password are required as strings" });
    }

    const secretName = `${username}pass`;
    let secret;
    try {
      secret = await secretClient.getSecret(secretName);
    } catch (err) {
      if (err.statusCode === 404 || err.code === "SecretNotFound") {
        return res.status(404).json({ error: "Secret not found" });
      }
      console.error("Key Vault error:", err);
      return res.status(500).json({ error: "Error accessing Key Vault", detail: err.message });
    }

    const match = safeCompare(secret?.value ?? "", password);
    return res.status(200).json({ match });
  } catch (ex) {
    console.error("Unhandled error in /validate:", ex);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
