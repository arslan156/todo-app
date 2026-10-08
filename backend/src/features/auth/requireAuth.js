const User = require("./user");
const {
  COOKIE_NAME,
  verifyToken,
  tokenPredatesPasswordChange,
  clearAuthCookie,
} = require("./token");

const unauthorized = (res) => {
  clearAuthCookie(res);
  return res.status(401).json({ message: "Please sign in to continue." });
};

const forbidden = (res) =>
  res.status(403).json({ message: "You can only access your own data." });

// Loads the signed-in user from the auth cookie into req.user.
const authenticate = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return unauthorized(res);

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return unauthorized(res);
  }

  try {
    const user = await User.findById(payload.sub);
    if (!user || tokenPredatesPasswordChange(payload, user)) {
      return unauthorized(res);
    }
    req.user = user;
    return next();
  } catch (error) {
    console.error("Authentication failed:", error.message);
    return res.status(500).json({ message: "Unable to verify your sign-in." });
  }
};

/*
  The feature routes identify the user with a userId sent by the page.
  After authenticating, a userId in the body or query must match the
  signed-in user, and the body's userId is set to the verified one.
*/
const requireAuth = (req, res, next) =>
  authenticate(req, res, () => {
    const self = String(req.user._id);
    const claimed = [req.body?.userId, req.query?.userId].filter(
      (value) => value !== undefined
    );
    if (claimed.some((value) => String(value) !== self)) {
      return forbidden(res);
    }
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      req.body = {};
    }
    req.body.userId = self;
    return next();
  });

// For router.param("userId", ensureSelfParam): a userId in the URL path
// must also be the signed-in user.
const ensureSelfParam = (req, res, next, value) =>
  String(value) === String(req.user?._id) ? next() : forbidden(res);

module.exports = { authenticate, requireAuth, ensureSelfParam };
