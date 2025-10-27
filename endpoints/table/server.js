// endpoints/table/server.js
const express = require("express");
const crypto = require("crypto");
const { TableClient } = require("@azure/data-tables");
const { DefaultAzureCredential } = require("@azure/identity");

const router = express.Router();

// Config
const storageAccountName = process.env.STORAGE_ACCOUNT_NAME || "storageacctabletaskgen";
const tableName = process.env.TABLE_NAME || "tabletaskGen";
const tableClient = new TableClient(
  `https://${storageAccountName}.table.core.windows.net`,
  tableName,
  new DefaultAzureCredential()
);

const validStatuses = ["Not Started", "In Progress", "Completed"];

// Validate payload
function validateTasksPayload(payload) {
  if (!payload.username || typeof payload.username !== "string") return "username required";
  if (!Array.isArray(payload.tasks)) return "tasks must be an array";
  for (const t of payload.tasks) {
    if (!t.name || typeof t.name !== "string") return "task name required";
    if (!validStatuses.includes(t.status)) return `task status must be one of ${validStatuses.join(", ")}`;
  }
  return null;
}

// POST /api/tasks
router.post("/", async (req, res) => {
  const error = validateTasksPayload(req.body);
  if (error) return res.status(400).json({ error });

  const { username, tasks } = req.body;
  const partitionKey = username;

  try {
    const existing = tableClient.listEntities({ queryOptions: { filter: `PartitionKey eq '${partitionKey}'` } });
    for await (const entity of existing) {
      await tableClient.deleteEntity(entity.partitionKey, entity.rowKey);
    }

    for (const t of tasks) {
      await tableClient.createEntity({
        partitionKey,
        rowKey: crypto.randomUUID(),
        name: t.name,
        status: t.status
      });
    }

    res.json({ message: "Tasks updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Storage error", detail: err.message });
  }
});

// GET /api/tasks?username=<username>
router.get("/", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "username required" });

  try {
    const tasks = [];
    const entities = tableClient.listEntities({ queryOptions: { filter: `PartitionKey eq '${username}'` } });
    for await (const entity of entities) {
      tasks.push({ name: entity.name, status: entity.status });
    }
    res.json({ username, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Storage error", detail: err.message });
  }
});

module.exports = router;
