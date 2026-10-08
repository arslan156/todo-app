const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  type: {
    type: String,
    default: "application/octet-stream",
    maxlength: 120,
  },
  size: {
    type: Number,
    required: true,
    min: 0,
  },
  // Base64 file contents. Left out of mailbox listings; fetched on download.
  data: {
    type: String,
    required: true,
  },
});

const mailboxMessageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    legacyId: {
      type: String,
      maxlength: 100,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 254,
    },
    to: {
      type: String,
      default: "",
      trim: true,
      maxlength: 254,
    },
    cc: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    bcc: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    preview: {
      type: String,
      default: "",
      maxlength: 120,
    },
    body: {
      type: String,
      default: "",
      maxlength: 50000,
    },
    category: {
      type: String,
      enum: ["personal", "work", "social", "private"],
      default: "personal",
    },
    folder: {
      type: String,
      enum: ["inbox", "sent", "drafts", "archive", "spam", "trash"],
      default: "inbox",
    },
    starred: {
      type: Boolean,
      default: false,
    },
    important: {
      type: Boolean,
      default: false,
    },
    unread: {
      type: Boolean,
      default: false,
    },
    attachment: {
      type: Boolean,
      default: false,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    sentByMe: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

mailboxMessageSchema.index({ owner: 1, createdAt: -1 });
mailboxMessageSchema.index(
  { owner: 1, legacyId: 1 },
  { unique: true, partialFilterExpression: { legacyId: { $type: "string" } } }
);

module.exports = mongoose.model("MailboxMessage", mailboxMessageSchema);
