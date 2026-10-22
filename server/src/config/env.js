import "dotenv/config";
export const env = {
  port: Number(process.env.PORT || 4200),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27019/knowflow_ai",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  maxUpload: Number(process.env.MAX_UPLOAD_BYTES || 10485760),
  chunkSize: Number(process.env.CHUNK_SIZE || 900),
  overlap: Number(process.env.CHUNK_OVERLAP || 120),
  llmMode: process.env.LLM_MODE || "demo",
  llmUrl: process.env.LLM_API_URL,
  llmKey: process.env.LLM_API_KEY,
  llmModel: process.env.LLM_MODEL,
};
