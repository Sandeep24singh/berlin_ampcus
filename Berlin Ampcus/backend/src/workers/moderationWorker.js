import { Worker } from "bullmq";
import { connectDatabase } from "../config/db.js";
import { redisConnection } from "../config/redis.js";
import { MODERATION_QUEUE_NAME, deadLetterQueue } from "../queues/moderationQueue.js";
import { markPostModerationFailure, moderatePostById } from "../services/moderationService.js";

async function startWorker() {
  await connectDatabase();

  const worker = new Worker(
    MODERATION_QUEUE_NAME,
    async (job) => {
      try {
        await moderatePostById(job.data.postId);
      } catch (error) {
        await markPostModerationFailure(job.data.postId, error.message);

        if (job.attemptsMade + 1 >= (job.opts.attempts || 1)) {
          await deadLetterQueue.add("moderation-failed", {
            postId: job.data.postId,
            reason: error.message
          });
        }

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 5
    }
  );

  worker.on("completed", (job) => {
    console.log(`Moderation job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Moderation job ${job?.id} failed:`, error.message);
  });

  console.log("Clean Stream moderation worker started");
}

startWorker().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});
