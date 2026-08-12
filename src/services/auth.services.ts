import crypto from "crypto";
import db from "../db/db.js";
import { eq, sql } from "drizzle-orm";
import { users, refreshtoken } from "../db/models/auth.js";
import { appEvents } from "../lib/events.js";
import { AUTH_EVENTS } from "../events/auth.events.js";
import { UnauthorizedError, ValidationError } from "../lib/error.js";
import { verifyPassword } from "../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.util.js";
import { inflate } from "zlib";

export const login = async (
  email: string,
  password: string,
  correlationId: string,
  deviceInfo: string,
) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    appEvents.emit(AUTH_EVENTS.AUTH_LOGIN_FAIL, {
      email,
      reason: "user_not_found",
      deviceInfo,
      correlationId,
    });

    throw new ValidationError("Invalid credentials");
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    appEvents.emit(AUTH_EVENTS.AUTH_LOGIN_FAIL, {
      email,
      reason: "invalid_password",
      deviceInfo,
      correlationId,
    });

    throw new ValidationError("Invalid credentials");
  }

  appEvents.emit(AUTH_EVENTS.AUTH_LOGIN, {
    email,
    deviceInfo,
    correlationId,
  });

  // create tokens
  const accessToken = generateAccessToken({
    id: user.id,
    name: user.name,
    department: user.department,
  });
  const refreshToken = generateRefreshToken({
    id: user.id,
    name: user.name,
    department: user.department,
  });

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await db.insert(refreshtoken).values({
    userId: user.id,
    token: tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7days
  });

  return {
    code: 201,
    message: "User logged in successfully",
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
    },
    meta: {
      accessToken,
      refreshToken,
    },
  };
};

export const refresh = async (
  rawRefreshToken: string,
  correlationId: string,
  deviceInfo: string,
) => {
  let payload;

  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch (err) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (payload.type !== "refresh") {
    throw new UnauthorizedError("Invalid token type");
  }

  const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
  const [stored] = await db.select().from(refreshtoken).where(eq(refreshtoken.token, tokenHash));

  if (!stored || stored.expiresAt < new Date()) {
    appEvents.emit(AUTH_EVENTS.AUTH_REFRESH_FAIL, {
      userId: payload.sub,
      reason: "refresh_token_expired",
      correlationId,
      deviceInfo,
    });
    throw new UnauthorizedError("Refresh token expired or revoked");
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub));

  if (!user) {
    appEvents.emit(AUTH_EVENTS.AUTH_REFRESH_FAIL, {
      userId: payload.sub,
      reason: "user_not_found",
      correlationId,
      deviceInfo,
    });
    throw new UnauthorizedError("user not found");
  }

  await db.delete(refreshtoken).where(eq(refreshtoken.token, tokenHash));

  const newAccessToken = generateAccessToken({
    id: user.id,
    name: user.name,
    department: user.department,
  });
  const newRefreshToken = generateRefreshToken({
    id: user.id,
    name: user.name,
    department: user.department,
  });
  const newHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

  //save to refreshtoken db
  await db.insert(refreshtoken).values({
    userId: payload.sub,
    token: newHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7days
  });

  appEvents.emit(AUTH_EVENTS.AUTH_REFRESH, {
    userId: payload.sub,
    name: payload.name,
    department: payload.department,
    correlationId,
    deviceInfo,
  });

  return {
    code: 201,
    message: "new tokens created successfully",
    meta: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sub: payload.sub,
      name: payload.name,
      department: payload.department,
    },
  };
};

export const logout = async (rawRefreshToken: string) => {
  const token = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

  await db.delete(refreshtoken).where(eq(refreshtoken.token, token));

  return;
};

type RefreshResult = Awaited<ReturnType<typeof refresh>>;
const inFlight = new Map<string, Promise<RefreshResult>>();
const recentlyCompleted = new Map<string, { result: RefreshResult; expiresAt: number }>();
const GRACE_MS = 8000;

export const coordinatedRefresh = async (
  refreshToken: string,
  correlationId: string,
  userAgent: string,
): Promise<RefreshResult> => {
  const cached = recentlyCompleted.get(refreshToken);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.result);
  }

  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const promise = refresh(refreshToken, correlationId, userAgent)
     .then((result) => {
      recentlyCompleted.set(refreshToken, { result, expiresAt: Date.now() + GRACE_MS });
      setTimeout(() => recentlyCompleted.delete(refreshToken), GRACE_MS).unref();
      return result;
    })
    .finally(() => {
      inFlight.delete(refreshToken);
    });

  inFlight.set(refreshToken, promise);

  return promise;
};
