import fs from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";
import { Document, Chunk } from "../models/models.js";
import { env } from "../config/env.js";
import { splitText } from "../utils/chunking.js";
export async function ingest(file) {
  const storageName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).toLowerCase()}`;
  const document = await Document.create({
    name: file.originalname,
    storageName,
    mimeType: file.mimetype,
    size: file.size,
    status: "processing",
  });
  try {
    const buffer = await fs.readFile(file.path);
    let text = "";
    let pageCount;
    if (file.mimetype === "application/pdf") {
      const parsed = await pdf(buffer);
      text = parsed.text;
      pageCount = parsed.numpages;
    } else text = buffer.toString("utf8");
    const pieces = splitText(text, env.chunkSize, env.overlap);
    if (!pieces.length) throw new Error("No extractable text was found");
    await Chunk.insertMany(
      pieces.map((piece, index) => ({
        documentId: document._id,
        documentName: document.name,
        text: piece.text,
        page: pageCount
          ? Math.min(
              pageCount,
              Math.floor(index / (pieces.length / pageCount)) + 1,
            )
          : undefined,
        index,
      })),
    );
    document.status = "ready";
    document.pageCount = pageCount;
    document.processedAt = new Date();
    await document.save();
    return document;
  } catch (error) {
    document.status = "failed";
    document.error = error.message;
    await document.save();
    throw error;
  } finally {
    await fs.unlink(file.path).catch(() => {});
  }
}
