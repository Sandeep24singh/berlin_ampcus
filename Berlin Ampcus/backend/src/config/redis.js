import IORedis from "ioredis";
import { env } from "./env.js";

const redisConfig = env.redisUrl
  ? env.redisUrl
  : {
      host: env.redisHost,
      port: env.redisPort,
      password: env.redisPassword || undefined,
      maxRetriesPerRequest: null
    };

export const redisConnection = new IORedis(redisConfig, env.redisUrl ? { maxRetriesPerRequest: null } : undefined);
