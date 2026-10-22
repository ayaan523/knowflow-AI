import mongoose from "mongoose";
const documentSchema = new mongoose.Schema(
  {
    name: String,
    storageName: String,
    mimeType: String,
    size: Number,
    pageCount: Number,
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    error: String,
    createdAt: { type: Date, default: Date.now },
    processedAt: Date,
  },
  { timestamps: true },
);
const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      index: true,
    },
    documentName: String,
    text: String,
    page: Number,
    index: Number,
  },
  { timestamps: true },
);
const conversationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "New conversation" },
    messages: [
      {
        role: String,
        content: String,
        sources: [
          {
            documentId: String,
            documentName: String,
            page: Number,
            chunkId: String,
            passage: String,
          },
        ],
        mode: String,
        createdAt: Date,
      },
    ],
  },
  { timestamps: true },
);
export const Document = mongoose.model("Document", documentSchema);
export const Chunk = mongoose.model("Chunk", chunkSchema);
export const Conversation = mongoose.model("Conversation", conversationSchema);
