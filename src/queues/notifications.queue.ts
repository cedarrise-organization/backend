// queues/notification.queue.ts
import { Queue } from "bullmq";

const redis_username = process.env.REDIS_USERNAME! as string;
const redis_password = process.env.REDIS_PASSWORD! as string;
const redis_host = process.env.REDIS_HOST! as string;
const redis_port = Number(process.env.REDIS_PORT!);

export const notificationQueue = new Queue("notification-queue", {
  connection: {
    username: redis_username,
    password: redis_password,
    host: redis_host,
    port: redis_port,
  },
  // The defaultJobOptions apply to every job added to this queue.
  // To add options to specific jobs, add them as the third argument to the queue.add() function
  // Where the first argument is the name: string, second is data: object, and third options: object
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: { count: 200 }, // keep up to 200 jobs then cleanup older jobs automatically
    removeOnFail: { count: 500 }, // keep up to 500 jobs then cleanup older jobs automatically
  },
});

export const scheduleWeeklyNotificationJob = async () => {
  await notificationQueue.upsertJobScheduler(
    "weekly-notification-check",
    {
      pattern: "0 18 * * 0", // every Sunday at 6:00 PM
      tz: "Africa/Lagos",
    },
    {
      name: "run-notification-checks",
      data: {},
    },
  );
};

export const testAddtoQueue = async () => {
  const job = await notificationQueue.add("run-notification-checks", {});
  return job.id;
};