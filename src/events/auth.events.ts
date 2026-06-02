import logger from "../configs/logger.config.js";
import { appEvents } from "../lib/events.js";

// DEFINE EVENT NAMES AS CONSTANTS
export const AUTH_EVENTS = {
  AUTH_LOGIN: "auth:login",
  AUTH_LOGIN_FAIL: "auth:login-fail",
  AUTH_REFRESH: "auth:refresh",
  AUTH_REFRESH_FAIL: "auth:refresh-fail",
} as const;

// LOG USER LOGIN
appEvents.on(AUTH_EVENTS.AUTH_LOGIN, async (data) => {
  logger.info("user logged in", {
    email: data.email,
    // deviceInfo: data.deviceInfo,
    // correlationId: data.correlationId
  });
});

// LOG USER LOGIN
appEvents.on(AUTH_EVENTS.AUTH_LOGIN_FAIL, async (data) => {
  logger.info("user failed to log in", {
    email: data.email,
    reason: data.reason,
    // deviceInfo: data.deviceInfo,
    // correlationId: data.correlationId
  });
});

// LOG REFRESH TOKEN RETIREVAL
appEvents.on(AUTH_EVENTS.AUTH_REFRESH, async (data) => {
  logger.info("user got refresh token", {
    userId: data.userId,
    // deviceInfo: data.deviceInfo,
    // correlationId: data.correlationId
  });
});

// LOG REFRESH TOKEN RETIREVAL ERROR
appEvents.on(AUTH_EVENTS.AUTH_REFRESH_FAIL, async (data) => {
  logger.info("user failed to get refresh token ", {
    userId: data.userId,
    reason: data.reason,
    // deviceInfo: data.deviceInfo,
    // correlationId: data.correlationId
  });
});