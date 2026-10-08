const router = require("express").Router();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("./user");
const { authenticate } = require("./requireAuth");
const { setAuthCookie, clearAuthCookie } = require("./token");
const { sendPasswordResetEmail } = require("../../services/mailer");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const CLIENT_URL = (
  process.env.CLIENT_URL || "http://localhost:3000"
).split(",")[0].trim();

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const passwordProblem = (password) => {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 128) {
    return "Password must be 128 characters or fewer.";
  }
  return "";
};

// REGISTER (signs the new account in)
router.post("/register", async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const username =
      typeof req.body.username === "string" ? req.body.username.trim() : "";
    const { password } = req.body;

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Email, username, and password are required." });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!USERNAME_PATTERN.test(username)) {
      return res.status(400).json({
        message:
          "Username must be 3-30 characters: letters, numbers, dots, dashes or underscores.",
      });
    }
    const invalidPassword = passwordProblem(password);
    if (invalidPassword) {
      return res.status(400).json({ message: invalidPassword });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email or username is already registered." });
    }

    const user = await User.create({
      email,
      username,
      password: await bcrypt.hash(password, 10),
    });
    setAuthCookie(res, user);
    return res
      .status(201)
      .json({ message: "Sign Up Successful", user: user.toPublicJSON() });
  } catch (error) {
    console.error("Registration failed:", error.message);
    return res.status(500).json({ message: "Unable to register account." });
  }
});

// SIGN IN
router.post("/signin", async (req, res) => {
  try {
    const login = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const submittedPassword = req.body.password;
    if (!login || typeof submittedPassword !== "string" || !submittedPassword) {
      return res
        .status(400)
        .json({ message: "Email/username and password are required." });
    }

    // The login can be either the email or the username.
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });
    const isPasswordCorrect =
      user && (await bcrypt.compare(submittedPassword, user.password));

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: "Invalid email/username or password." });
    }

    setAuthCookie(res, user, { remember: req.body.remember !== false });
    return res.status(200).json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error("Sign-in failed:", error.message);
    return res.status(500).json({ message: "Unable to sign in." });
  }
});

// SIGN OUT
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Signed out." });
});

// CURRENT USER (restores the session from the cookie)
router.get("/me", authenticate, (req, res) =>
  res.status(200).json({ user: req.user.toPublicJSON() })
);

// FORGOT PASSWORD: emails a single-use reset link
router.post("/forgot-password", async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  // Same answer whether or not the account exists, so the form can't be
  // used to find out who is registered.
  const genericResponse = {
    message:
      "If an account exists for that email, we've sent a link to reset the password.",
  };

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json(genericResponse);

    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetTokenHash = hashResetToken(token);
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    await sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      resetUrl: `${CLIENT_URL}/reset-password?token=${token}`,
    });
    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Password reset request failed:", error.message);
    return res
      .status(500)
      .json({ message: "Unable to send the reset email. Please try again." });
  }
});

// RESET PASSWORD: sets the new password and signs the user in
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      return res
        .status(400)
        .json({ message: "This reset link is invalid. Request a new one." });
    }
    const invalidPassword = passwordProblem(password);
    if (invalidPassword) {
      return res.status(400).json({ message: invalidPassword });
    }

    const user = await User.findOne({
      passwordResetTokenHash: hashResetToken(token),
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired. Request a new one.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    // Signs out every other session that still has an old token.
    user.passwordChangedAt = new Date();
    await user.save();

    setAuthCookie(res, user);
    return res.status(200).json({
      message: "Your password has been reset.",
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Password reset failed:", error.message);
    return res.status(500).json({ message: "Unable to reset the password." });
  }
});

module.exports = router;
