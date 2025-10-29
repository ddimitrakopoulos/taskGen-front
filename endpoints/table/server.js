// endpoints/table/server.js
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { TableClient } = require("@azure/data-tables");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const router = express.Router();

// -------------------------
// 🔹 Azure configuration
// -------------------------
const storageAccountName = process.env.STORAGE_ACCOUNT_NAME || "storageacctabletaskgen";
const tableName = process.env.TABLE_NAME || "tabletaskGen";
const vaultName = process.env.KEY_VAULT_NAME || "kv-taskGen-2";

const keyVaultUrl = `https://${vaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyVaultUrl, credential);

const tableClient = new TableClient(
  `https://${storageAccountName}.table.core.windows.net`,
  tableName,
  credential
);

const validStatuses = ["Not Started", "In Progress", "Completed"];

// -------------------------
// 🔹 JWT authentication middleware
// -------------------------
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = (await secretClient.getSecret("jwtsecret")).value;
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // contains { username, iat, exp }
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// -------------------------
// 🔹 Helper: validate tasks
// -------------------------
function validateTasksPayload(payload) {
  if (!Array.isArray(payload.tasks)) return "tasks must be an array";
  for (const t of payload.tasks) {
    if (!t.name || typeof t.name !== "string") return "task name required";
    if (!validStatuses.includes(t.status))
      return `task status must be one of ${validStatuses.join(", ")}`;
  }
  return null;
}

// -------------------------
// 🔹 Protected routes
// -------------------------

// POST /api/tasks → replace tasks for the logged-in user
router.post("/", authMiddleware, async (req, res) => {
  const username = req.user.username; // ✅ comes from token
  const { tasks } = req.body;

  const error = validateTasksPayload({ tasks });
  if (error) return res.status(400).json({ error });

  const partitionKey = username;

  try {
    // Delete old tasks
    const existing = tableClient.listEntities({
      queryOptions: { filter: `PartitionKey eq '${partitionKey}'` },
    });

    for await (const entity of existing) {
      await tableClient.deleteEntity(entity.partitionKey, entity.rowKey);
    }

    // Insert new tasks
    for (const t of tasks) {
      await tableClient.createEntity({
        partitionKey,
        rowKey: crypto.randomUUID(),
        name: t.name,
        status: t.status,
      });
    }

    res.json({ message: "Tasks updated successfully", username });
  } catch (err) {
    console.error("Storage error:", err);
    res.status(500).json({ error: "Storage error", detail: err.message });
  }
});

// GET /api/tasks → get tasks for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  const username = req.user.username; // ✅ comes from token

  try {
    const tasks = [];
    const entities = tableClient.listEntities({
      queryOptions: { filter: `PartitionKey eq '${username}'` },
    });

    for await (const entity of entities) {
      tasks.push({ name: entity.name, status: entity.status });
    }

    res.json({ username, tasks });
  } catch (err) {
    console.error("Storage error:", err);
    res.status(500).json({ error: "Storage error", detail: err.message });
  }
});

module.exports = router;
