export const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // should browser send the cookie over https?
  sameSite: "none", // allows us to send cookies across different domains
  maxAge: 1000 * 60 * 60 * 24 * 7, // Long lived for retrieval 
} as const;

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // should browser send the cookie over https?
  sameSite: "none", // allows us to send cookies across different domains
  maxAge: 1000 * 60 * 60 * 24 * 7, // matches refresh token exp age
} as const;
