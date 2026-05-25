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

export const login = async (email: string, password: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    appEvents.emit(AUTH_EVENTS.AUTH_LOGIN_FAIL, {
      email,
      reason: "user_not_found",
      // deviceInfo: data.deviceInfo,
      // correlationId,
    });

    throw new ValidationError("Invalid credentials");
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    appEvents.emit(AUTH_EVENTS.AUTH_LOGIN_FAIL, {
      email,
      reason: "invalid_password",
      // deviceInfo: data.deviceInfo,
      // correlationId,
    });

    throw new ValidationError("Invalid credentials");
  }

  appEvents.emit(AUTH_EVENTS.AUTH_LOGIN, {
    email,
    // deviceInfo: data.deviceInfo,
    // correlationId,
  });

  // create tokens
  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await db.insert(refreshtoken).values({
    id: sql`uuid_generate_v4()`,
    userId: user.id,
    token: tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7days
  });

  return {
    code: 201,
    message: "User logged in successfully",
    data: user,
    meta: {
      accessToken,
      refreshToken,
    },
  };
};

export const refresh = async (rawRefreshToken: string) => {
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
    });
    throw new UnauthorizedError("Refreshed token expired or revoked");
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub));

  if (!user) {
    appEvents.emit(AUTH_EVENTS.AUTH_REFRESH_FAIL, {
      userId: payload.sub,
      reason: "user_not_found",
    });
    throw new UnauthorizedError("user not found");
  }

  await db.delete(refreshtoken).where(eq(refreshtoken.token, tokenHash));

  const newAccessToken = generateAccessToken({ id: user.id });
  const newRefreshToken = generateRefreshToken({ id: user.id });
  const newHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

  //save to refreshtoken db
  await db.insert(refreshtoken).values({
    id: sql`uuid_generate_v4()`,
    userId: payload.sub,
    token: newHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7days
  });

  appEvents.emit(AUTH_EVENTS.AUTH_REFRESH, {
    userId: payload.sub,
  });

  return {
    code: 201,
    message: "new tokens created successfully",
    meta: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sub: payload.sub,
    },
  };
};

export const logout = async (rawRefreshToken: string) => {
  const token = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

  await db.delete(refreshtoken).where(eq(refreshtoken.token, token));

  return;
};
