import { Worker, Job } from "bullmq";
import {
  checkLowAttendanceRate,
  checkLowMentorshipEngagement,
  checkPotentialDropoutRisk,
  checkScoreDropAlert,
  checkVolunteerInactivity,
  syncNotificationCandidates,
  autoResolveStaleNotifications,
} from "../../services/dashboard.services.js";
import logger from "../../configs/logger.config.js";

const redis_username = process.env.REDIS_USERNAME! as string;
const redis_password = process.env.REDIS_PASSWORD! as string;
const redis_host = process.env.REDIS_HOST! as string;
const redis_port = Number(process.env.REDIS_PORT!);

const worker = new Worker(
  "notification-queue",
  async (job: Job) => {
    if (job.name !== "run-notification-checks") return;

    const candidates = [
      ...(await checkPotentialDropoutRisk()),
      ...(await checkLowAttendanceRate()),
      ...(await checkLowMentorshipEngagement()),
      ...(await checkScoreDropAlert()),
      ...(await checkVolunteerInactivity()),
    ];

    const insertedOrUpdatedCount = await syncNotificationCandidates(candidates);
    const resolvedCount = await autoResolveStaleNotifications(candidates);

    logger.info("Notification checks completed", {
      jobId: job.id,
      candidatesFound: candidates.length,
      insertedOrUpdatedCount,
      resolvedCount,
    });

    return {
      candidatesFound: candidates.length,
      insertedOrUpdatedCount,
      resolvedCount,
    };
  },
  {
    connection: {
      username: redis_username,
      password: redis_password,
      host: redis_host,
      port: redis_port,
    },
    // 1 job runs
    concurrency: 1,
  },
);

worker.on("completed", (job) => {
  logger.info("Notification job completed", {
    jobId: job.id,
  });
});

worker.on("failed", async (job, error) => {
  if (!job) return;

  if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
    logger.error("Notification job failed permanently", {
      jobId: job.id,
      error,
    });
  }
});

worker.on("error", (error) => {
  logger.error("Notification worker error", {
    error,
  });
});

export { worker };
