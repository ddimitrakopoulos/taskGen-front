// server.js (ES modules)
const express = require("express");
const crypto = require("crypto");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const app = express();
app.use(express.json());

// Configuration: set KEY_VAULT_NAME environment variable
const vaultName = "kv-taskGen-2";
if (!vaultName) {
  console.error("Environment variable KEY_VAULT_NAME is required (e.g. myvault)");
  process.exit(1);
}
const keyVaultUrl = `https://${vaultName}.vault.azure.net`;

// Azure auth: DefaultAzureCredential will use managed identity, environment vars, or az login.
const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyVaultUrl, credential);

// Helper: constant-time string comparison
function safeCompare(a, b) {
  // Convert to buffers
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");

  // If lengths differ, immediately return false (timingSafeEqual requires same length)
  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * POST /validate
 * body: { "username": "...", "password": "..." }
 *
 * Response:
 * 200 { match: true }   -> password matches secret value
 * 200 { match: false }  -> password does not match secret value
 * 404 { error: "Secret not found" } -> secret missing
 * 400 / 500 -> validation / server errors
 */
app.post("/validate", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "username and password are required as strings" });
    }

    const secretName = `${username}pass`;

    // Fetch secret from Key Vault
    let secret;
    try {
      secret = await secretClient.getSecret(secretName);
    } catch (err) {
      // Secret not found will throw a 404 style error from SDK
      // Check code/status for clarity
      const notFound = err.statusCode === 404 || err.code === "SecretNotFound" || err.message?.includes("not found");
      if (notFound) {
        return res.status(404).json({ error: "Secret not found", secretName });
      }
      // Other errors (auth, network, etc.)
      console.error("Key Vault error:", err);
      return res.status(500).json({ error: "Error accessing Key Vault", detail: err.message });
    }

    const secretValue = secret?.value ?? "";

    // Compare using constant-time compare
    const match = safeCompare(secretValue, password);

    // Optionally, don't reveal too much to callers (here we return boolean for demo)
    return res.status(200).json({ match });
  } catch (ex) {
    console.error("Unhandled error in /validate:", ex);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Validation service listening on port ${PORT}`);
});
