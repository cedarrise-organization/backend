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
			status: false,
			error: {
				code: "RATE_LIMITED",
				message: options.message,
			},
		},
		keyGenerator:
			options.keyGenerator ||
			((req: Request) =>
				`${(req as any).body.email.toString()} ${ipKeyGenerator(req.ip!)}` ||
				(req as any).user?.id ||
				ipKeyGenerator(req.ip!) ||
				"anonymous"),
	});
};

// Auth endpoints: same for everyone, keyed by IP (user isn't authenticated yet)
export const authLimiter = createLimiter({
	windowMs: 15 * 60 * 1000, // 15 mins
	limit: 5,
	message: "Too many login attempts. Please try again later.",
	keyGenerator: (req: Request) =>
		`${(req as any).body.email.toString()} ${ipKeyGenerator(req.ip!)}` ||
		ipKeyGenerator(req.ip!) ||
		"anonymous",
});

// Client-side form submission endpoints: keyed by IP (user isn't an authenticated admin)
export const formUploadLimiter = createLimiter({
	windowMs: 15 * 60 * 1000, // 15 mins
	limit: 3,
	message: `Too many submission attempts. Please try again later`,
	keyGenerator: (req: Request) => ipKeyGenerator(req.ip!) || "anonymous",
});

// Client-side form request endpoints: keyed by IP (user isn't an authenticated admin)
export const sendLinksLimiter = createLimiter({
	windowMs: 15 * 60 * 1000, // 15 mins
	limit: 5,
	message: `Too many request attempts. Please try again later`,
	keyGenerator: (req: Request) => ipKeyGenerator(req.ip!) || "anonymous",
});

// Client-side donation attempt endpoint: keyed by IP (user isn't an authenticated admin)
export const donationLimiter = createLimiter({
	windowMs: 10 * 60 * 1000, // 10 mins
	limit: 5,
	message: `Too many donation attempts. Please try again in 10 minutes`,
	keyGenerator: (req: Request) => ipKeyGenerator(req.ip!) || "anonymous",
});

// General rate limiting
export const generalLimiter = createLimiter({
	windowMs: 15 * 60 * 1000, // 10 mins
	limit: 60,
	message: `Too many request attempts. Please try again later`,
	keyGenerator: (req: Request) => ipKeyGenerator(req.ip!) || "anonymous",
});

/*
ADDITIONAL READING
// Response headers on every request:
RateLimit-Limit: 100 // Total allowed in this window
RateLimit-Remaining: 73 // How many you have left
RateLimit-Reset: 1681500000 // Unix timestamp when the window resets

// Additional header when rate limited (429 response):
Retry-After: 120 // Seconds until the client can retry
*/
