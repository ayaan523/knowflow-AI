import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { splitText } from "../src/utils/chunking.js";
import { retrieve } from "../src/utils/retrieval.js";
process.env.NODE_ENV = "test";
const { app } = await import("../src/server.js");
test("health endpoint reports demo mode", async () => {
  const response = await request(app).get("/api/v1/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.mode, "demo");
});
test("chunking preserves text and creates overlap", () => {
  const chunks = splitText("alpha ".repeat(300), 100, 20);
  assert.ok(chunks.length > 1);
  assert.ok(chunks[0].text.length <= 100);
});
test("retrieval ranks matching passages and handles no evidence", () => {
  const rows = [
    { text: "PostgreSQL stores relational data", documentName: "db.txt" },
    { text: "Cats sleep often", documentName: "pets.txt" },
  ];
  assert.equal(retrieve(rows, "relational data")[0].documentName, "db.txt");
  assert.equal(retrieve(rows, "quantum physics").length, 0);
});
