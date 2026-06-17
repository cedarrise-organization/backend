//MODELS
import * as z from "zod";

const notificationTypeEnum = z.enum([
  "POTENTIAL_DROPOUT_RISK",
  "LOW_ATTENDANCE_RATE",
  "LOW_MENTORSHIP_ENGAGEMENT",
  "SCORE_DROP_ALERT",
  "VOLUNTEER_INACTIVITY",
]);
const notificationSeverityEnum = z.enum(["low", "medium", "high", "critical"]);
const notificationEntityTypeEnum = z.enum([
  "ash",
  "volunteer",
  "tacots",
  "capacity_building",
  "administrative",
]);
const notificationStatusEnum = z.enum(["active", "dismissed", "resolved", "expired"]);

export const createNotificationSchema = z.object({
  body: z.object({
    type: notificationTypeEnum,
    title: z.string().min(3, "title must have at least 3 characters"),
    message: z.string().min(3, "message must have at least 3 characters"),
    severity: notificationSeverityEnum,
    entityType: notificationEntityTypeEnum,
    dedupeKey: z.string().min(3, "dedupeKey must have at least 3 characters"),
    status: notificationStatusEnum.optional().default("active"),
    expiresAt: z.coerce.date().optional(),
  }),
});
export const notificationIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});
export const updateNotificationStatusSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
  body: z.object({
    status: z.enum(["dismissed", "resolved", "expired"]),
  }),
});
export const notificationQuerySchema = z.object({
  query: z.object({
    status: notificationStatusEnum.optional(),
    type: notificationTypeEnum.optional(),
    entityType: notificationEntityTypeEnum.optional(),

    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
  }),
});