const crypto = require("crypto");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const COOKIE_NAME = "token";
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const isProduction = process.env.NODE_ENV === "production";

const secret = (() => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (isProduction) {
    throw new Error("JWT_SECRET must be set in production.");
  }
  console.warn(
    "JWT_SECRET is not set; using a temporary secret. Everyone is signed out when the server restarts."
  );
  return crypto.randomBytes(48).toString("hex");
})();

// "lax" works while the frontend and API share a site (localhost:3000 and
// localhost:1000 do). Set COOKIE_SAME_SITE=none when they are on different
// domains; the cookie is then only sent over HTTPS.
const sameSite = process.env.COOKIE_SAME_SITE || "lax";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction || sameSite === "none",
  sameSite,
  path: "/",
};

const signToken = (user) =>
  jwt.sign({ sub: String(user._id) }, secret, {
    expiresIn: TOKEN_TTL_SECONDS,
  });

const verifyToken = (token) => jwt.verify(token, secret);

// Tokens issued before the last password change stop working.
const tokenPredatesPasswordChange = (payload, user) =>
  Boolean(
    user.passwordChangedAt &&
      payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
  );

// remember: false makes a browser-session cookie (gone when the browser
// closes); the token itself still expires after TOKEN_TTL_SECONDS.
const setAuthCookie = (res, user, { remember = true } = {}) =>
  res.cookie(COOKIE_NAME, signToken(user), {
    ...cookieOptions,
    ...(remember ? { maxAge: TOKEN_TTL_SECONDS * 1000 } : {}),
  });

const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions);

module.exports = {
  COOKIE_NAME,
  verifyToken,
  tokenPredatesPasswordChange,
  setAuthCookie,
  clearAuthCookie,
};
