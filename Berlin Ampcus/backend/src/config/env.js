import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clean-stream",
  jwtSecret: process.env.JWT_SECRET || "development-secret",
  redisUrl: process.env.REDIS_URL || "",
  redisHost: process.env.REDIS_HOST || "127.0.0.1",
  redisPort: Number(process.env.REDIS_PORT || 6379),
  redisPassword: process.env.REDIS_PASSWORD || "",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://127.0.0.1:8001",
  mlRequestTimeoutMs: Number(process.env.ML_REQUEST_TIMEOUT_MS || 30000),
  clientUrl: process.env.CLIENT_URL || "http://127.0.0.1:5173",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 5)
};
