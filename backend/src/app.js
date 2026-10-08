const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("./features/auth/requireAuth");
const authRoutes = require("./features/auth/routes");
const taskRoutes = require("./features/tasks/routes");
const noteRoutes = require("./features/notes/routes");
const chatRoutes = require("./features/chat/routes");
const mailboxRoutes = require("./features/mailbox/routes");

const app = express();

// Mailbox messages can carry base64 attachments (up to 5 x 2 MB).
app.use("/api/v5", express.json({ limit: "15mb" }));
app.use(express.json());
// Credentials let the browser send the auth cookie; that needs explicit origins.
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim()),
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/api/v1", authRoutes);
app.use("/api/v2", requireAuth, taskRoutes);
app.use("/api/v3", requireAuth, noteRoutes);
app.use("/api/v4", requireAuth, chatRoutes);
app.use("/api/v5", requireAuth, mailboxRoutes);

module.exports = app;
