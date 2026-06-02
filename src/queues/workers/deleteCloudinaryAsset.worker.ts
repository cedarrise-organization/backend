import { Worker, Job } from "bullmq";
import { deleteFromCloudinary } from "../../utils/storage.util.js";
import logger from "../../configs/logger.config.js";

const redis_username = process.env.REDIS_USERNAME! as string;
const redis_password = process.env.REDIS_PASSWORD! as string;
const redis_host = process.env.REDIS_HOST! as string;
const redis_port = Number(process.env.REDIS_PORT!);

const worker = new Worker(
  "asset-removal",
  async (job: Job) => {
    const { publicId, resourceType } = job.data;

    await deleteFromCloudinary(publicId, resourceType);
  },
  {
    connection: {
      username: redis_username,
      password: redis_password,
      host: redis_host,
      port: redis_port,
    },
    // 3 jobs can run concurrently i.e this worker processes up to 3 documents simultaneously.
    // If you have 10 documents in the queue, the worker handles 3 at a time. The rest wait.
    // Set based on server cpu and memory
    concurrency: 3,
  },
);

// Event listeners for logging
worker.on("completed", (job) => {
  logger.info(`Job completed-> Deleted asset successfully`, {
    jobId: job.id,
    assetOwner: job.data.ownerId,
  });
});

worker.on("failed", async (job, error) => {
  if (!job) {
    return;
  }

  if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
    logger.error(`Job failed permanently`, {
      jobName: "Delete cloudinary asset",
      jobId: job?.id,
      assetOwner: job?.data.ownerId,
      error,
    });
  }
});

worker.on("error", (error) => {
  logger.error("Worker error on `delete cloudinary assets`", {
    error,
  });
});

export { worker };
