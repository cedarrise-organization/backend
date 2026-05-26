import { Request } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../configs/cache.config.js";

const createLimiter = (options: {
  windowMs: number;
  limit: number | ((req: Request) => number);
  message: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new RedisStore({
      sendCommand: async (...args: string[]) => ((await redisClient) as any).sendCommand(args),
    }),
    message: {
      sucess: false,
      error: {
        code: "RATE_LIMITED",
        message: options.message,
      },
    },
    keyGenerator:
      options.keyGenerator ||
      ((req: Request) => (req as any).user?.id || ipKeyGenerator(req.ip!) || "anonymous"),
  });
};

// Auth endpoints: same for everyone, keyed by IP (user isn't authenticated yet)
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 10,
  message: "Too many login attempts. Please try again later.",
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip!) || "anonymous",
});

// Client-side form submission endpoints: keyed by IP (user isn't an authenticated admin)
export const formUploadLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 5,
  message: `Too many submission attempts. Please try again later`,
    keyGenerator: (req: Request) => ipKeyGenerator(req.ip!) || "anonymous",
});
