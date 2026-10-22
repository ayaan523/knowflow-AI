import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { env } from "../config/env.js";
import { Document, Chunk, Conversation } from "../models/models.js";
import { ingest } from "../services/ingestion.js";
import { retrieve } from "../utils/retrieval.js";
import { answer } from "../services/llm.js";
const router = Router();
const upload = multer({
  dest: "tmp/",
  limits: { fileSize: env.maxUpload },
  fileFilter: (req, file, cb) =>
    cb(
      null,
      ["application/pdf", "text/plain"].includes(file.mimetype) ||
        [".pdf", ".txt"].includes(
          path.extname(file.originalname).toLowerCase(),
        ),
    ),
});
router.get("/health", (req, res) =>
  res.json({ status: "ok", mode: env.llmMode }),
);
router.post("/documents", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ error: { message: "Upload a PDF or plain text file" } });
    const document = await ingest(req.file);
    res.status(201).json({ data: document });
  } catch (error) {
    next(error);
  }
});
router.get("/documents", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    res.json({
      data: await Document.find()
        .select("-storageName -error")
        .sort({ createdAt: -1 })
        .limit(limit),
    });
  } catch (error) {
    next(error);
  }
});
router.get("/documents/:id", async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).select(
      "-storageName",
    );
    if (!document)
      return res.status(404).json({ error: { message: "Document not found" } });
    res.json({ data: document });
  } catch (error) {
    next(error);
  }
});
router.delete("/documents/:id", async (req, res, next) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document)
      return res.status(404).json({ error: { message: "Document not found" } });
    await Chunk.deleteMany({ documentId: req.params.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
router.post("/documents/:id/reprocess", async (req, res) =>
  res.status(501).json({
    error: {
      message:
        "Reprocessing requires the original file and is not available after temporary-file cleanup",
    },
  }),
);
router.post("/chat", async (req, res, next) => {
  try {
    const question = String(req.body.question || "").trim();
    if (question.length < 3 || question.length > 1000)
      return res.status(400).json({
        error: { message: "Question must be between 3 and 1000 characters" },
      });
    const chunks = await Chunk.find()
      .select("documentId documentName text page index")
      .lean();
    const sources = retrieve(chunks, question);
    const result = await answer(question, sources);
    const citations = sources.map((source) => ({
      documentId: source.documentId,
      documentName: source.documentName,
      page: source.page,
      chunkId: source._id,
      passage: source.text,
    }));
    let conversation;
    if (req.body.conversationId)
      conversation = await Conversation.findById(req.body.conversationId);
    if (!conversation)
      conversation = new Conversation({ title: question.slice(0, 60) });
    conversation.messages.push(
      { role: "user", content: question, createdAt: new Date() },
      {
        role: "assistant",
        content: result.text,
        sources: citations,
        mode: result.mode,
        createdAt: new Date(),
      },
    );
    await conversation.save();
    res.json({
      data: {
        conversationId: conversation._id,
        answer: result.text,
        mode: result.mode,
        sources: citations,
      },
    });
  } catch (error) {
    next(error);
  }
});
router.get("/conversations", async (req, res, next) => {
  try {
    res.json({
      data: await Conversation.find()
        .select("title createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(50),
    });
  } catch (error) {
    next(error);
  }
});
router.get("/conversations/:id", async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation)
      return res
        .status(404)
        .json({ error: { message: "Conversation not found" } });
    res.json({ data: conversation });
  } catch (error) {
    next(error);
  }
});
router.delete("/conversations/:id", async (req, res, next) => {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
router.get("/search", async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query)
      return res
        .status(400)
        .json({ error: { message: "Search query is required" } });
    const chunks = await Chunk.find().lean();
    res.json({ data: retrieve(chunks, query, 20) });
  } catch (error) {
    next(error);
  }
});
export default router;
