import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const MODERATION_QUEUE_NAME = "moderation-posts";
export const MODERATION_DLQ_NAME = "moderation-dead-letter";

export const moderationQueue = new Queue(MODERATION_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000
    },
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

export const deadLetterQueue = new Queue(MODERATION_DLQ_NAME, {
  connection: redisConnection
});
