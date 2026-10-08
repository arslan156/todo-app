const router = require("express").Router();
const { ensureSelfParam } = require("../auth/requireAuth");
const mongoose = require("mongoose");
const User = require("../auth/user");
const MailboxMessage = require("./mailboxMessage");

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const MAX_BODY_LENGTH = 50000;
// Attachment contents are only sent when a file is downloaded.
const LIST_PROJECTION = "-attachments.data";

const messageFields = [
  "sender",
  "address",
  "to",
  "cc",
  "bcc",
  "subject",
  "preview",
  "body",
  "category",
  "folder",
  "starred",
  "important",
  "unread",
  "attachment",
  "attachments",
  "sentByMe",
];
const mutableFields = [
  "to",
  "cc",
  "bcc",
  "subject",
  "preview",
  "body",
  "category",
  "folder",
  "starred",
  "important",
  "unread",
  "attachment",
  "attachments",
  "sentByMe",
];
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const validOwner = async (userId) => {
  if (!isValidId(userId)) return false;
  return Boolean(await User.exists({ _id: userId }));
};

const pickFields = (source, fields) =>
  fields.reduce((picked, field) => {
    if (source && source[field] !== undefined) picked[field] = source[field];
    return picked;
  }, {});

const validateMessage = (message, { requireSubject = false } = {}) => {
  if (
    requireSubject &&
    (typeof message.subject !== "string" || !message.subject.trim())
  ) {
    return "Message subject is required.";
  }
  if (
    message.subject !== undefined &&
    (typeof message.subject !== "string" || !message.subject.trim())
  ) {
    return "Message subject cannot be empty.";
  }
  if (
    message.body !== undefined &&
    (typeof message.body !== "string" || message.body.length > MAX_BODY_LENGTH)
  ) {
    return `Message body must be ${MAX_BODY_LENGTH} characters or fewer.`;
  }
  if (message.attachments !== undefined) {
    return validateAttachments(message.attachments);
  }
  return "";
};

const base64Bytes = (data) =>
  Math.floor((data.length * 3) / 4) - (data.match(/=*$/)[0].length || 0);

const validateAttachments = (attachments) => {
  if (!Array.isArray(attachments) || attachments.length > MAX_ATTACHMENTS) {
    return `A message can have at most ${MAX_ATTACHMENTS} attachments.`;
  }
  for (const file of attachments) {
    if (!file || typeof file !== "object") {
      return "Every attachment must be a file.";
    }
    // Files already saved are sent back by id only; their contents are kept.
    if (file._id && file.data === undefined) continue;
    if (typeof file.name !== "string" || !file.name.trim()) {
      return "Every attachment needs a file name.";
    }
    if (
      typeof file.data !== "string" ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(file.data)
    ) {
      return `${file.name} could not be read.`;
    }
    if (base64Bytes(file.data) > MAX_ATTACHMENT_BYTES) {
      return `${file.name} is larger than 2 MB.`;
    }
  }
  return "";
};

// Swaps id-only references for the stored files and builds new ones.
const resolveAttachments = (attachments, existingMessage) =>
  attachments
    .map((file) => {
      if (file._id && file.data === undefined) {
        return existingMessage?.attachments.id(file._id) || null;
      }
      return {
        name: file.name.trim(),
        type:
          typeof file.type === "string" && file.type ? file.type : undefined,
        size: base64Bytes(file.data),
        data: file.data,
      };
    })
    .filter(Boolean);

const withoutAttachmentData = (message) => {
  const plain = message.toObject();
  plain.attachments = (plain.attachments || []).map(
    ({ data, ...file }) => file
  );
  return plain;
};

// A userId in the URL must be the signed-in user.
router.param("userId", ensureSelfParam);

router.get("/messages/:userId", async (req, res) => {
  try {
    if (!(await validOwner(req.params.userId))) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }
    const messages = await MailboxMessage.find({
      owner: req.params.userId,
    })
      .select(LIST_PROJECTION)
      .sort({ createdAt: -1 });
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Mailbox loading failed:", error.message);
    return res.status(500).json({ message: "Unable to load mailbox." });
  }
});

router.post("/messages/import", async (req, res) => {
  try {
    const { userId, messages: sourceMessages } = req.body;
    if (!(await validOwner(userId))) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }
    if (
      !Array.isArray(sourceMessages) ||
      sourceMessages.length > 500
    ) {
      return res
        .status(400)
        .json({ message: "Mailbox import must contain at most 500 messages." });
    }

    const existing = await MailboxMessage.find({ owner: userId })
      .select(LIST_PROJECTION)
      .sort({ createdAt: -1 });
    if (existing.length) {
      return res.status(200).json({ messages: existing, imported: false });
    }

    if (
      sourceMessages.some(
        (message) => !message || typeof message !== "object" || Array.isArray(message)
      )
    ) {
      return res
        .status(400)
        .json({ message: "Every imported message must be an object." });
    }

    const data = sourceMessages.map((message) => ({
      ...pickFields(message, messageFields),
      attachments: [],
      ...(typeof message.id === "string" ? { legacyId: message.id } : {}),
      ...(message.createdAt && !Number.isNaN(new Date(message.createdAt).getTime())
        ? { createdAt: new Date(message.createdAt) }
        : {}),
    }));
    const invalidMessage = data
      .map((message) => validateMessage(message, { requireSubject: true }))
      .find(Boolean);
    if (invalidMessage) {
      return res.status(400).json({ message: invalidMessage });
    }

    const importedMessages = data.length
      ? await MailboxMessage.insertMany(
          data.map((message) => ({ ...message, owner: userId })),
          { ordered: true }
        )
      : [];
    return res
      .status(201)
      .json({ messages: importedMessages, imported: true });
  } catch (error) {
    if (error.code === 11000) {
      try {
        const messages = await MailboxMessage.find({ owner: req.body.userId })
          .select(LIST_PROJECTION)
          .sort({ createdAt: -1 });
        return res.status(200).json({ messages, imported: false });
      } catch (readError) {
        console.error("Mailbox import recovery failed:", readError.message);
        return res.status(500).json({ message: "Unable to import mailbox." });
      }
    }
    if (error.name === "ValidationError" || error.name === "BulkWriteError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Mailbox import failed:", error.message);
    return res.status(500).json({ message: "Unable to import mailbox." });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!(await validOwner(userId))) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }
    const data = pickFields(req.body, messageFields);
    const invalidMessage = validateMessage(data, { requireSubject: true });
    if (invalidMessage) {
      return res.status(400).json({ message: invalidMessage });
    }

    if (data.attachments) {
      data.attachments = resolveAttachments(data.attachments, null);
      data.attachment = data.attachments.length > 0;
    }

    const message = await MailboxMessage.create({ ...data, owner: userId });
    return res.status(201).json({ message: withoutAttachmentData(message) });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Mailbox message creation failed:", error.message);
    return res.status(500).json({ message: "Unable to save mailbox message." });
  }
});

router.put("/messages/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!(await validOwner(userId)) || !isValidId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Valid user and message IDs are required." });
    }
    const data = pickFields(req.body, mutableFields);
    const invalidMessage = validateMessage(data);
    if (invalidMessage) {
      return res.status(400).json({ message: invalidMessage });
    }

    const message = await MailboxMessage.findOne({
      _id: req.params.id,
      owner: userId,
    });
    if (!message) {
      return res.status(404).json({ message: "Mailbox message not found." });
    }
    if (data.attachments) {
      data.attachments = resolveAttachments(data.attachments, message);
      data.attachment = data.attachments.length > 0;
    }

    message.set(data);
    await message.save();
    return res.status(200).json({ message: withoutAttachmentData(message) });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Mailbox message update failed:", error.message);
    return res.status(500).json({ message: "Unable to update mailbox message." });
  }
});

router.patch("/messages/bulk", async (req, res) => {
  try {
    const { userId, ids, changes } = req.body;
    if (
      !(await validOwner(userId)) ||
      !Array.isArray(ids) ||
      !ids.length ||
      ids.length > 500 ||
      ids.some((id) => !isValidId(id))
    ) {
      return res
        .status(400)
        .json({ message: "A valid user ID and message ID list are required." });
    }
    const data = pickFields(changes || {}, mutableFields);
    // Files are only changed through the single-message endpoints.
    delete data.attachments;
    delete data.attachment;
    if (!Object.keys(data).length) {
      return res.status(400).json({ message: "At least one change is required." });
    }
    const invalidMessage = validateMessage(data);
    if (invalidMessage) {
      return res.status(400).json({ message: invalidMessage });
    }

    const result = await MailboxMessage.updateMany(
      { _id: { $in: ids }, owner: userId },
      { $set: data },
      { runValidators: true }
    );
    return res.status(200).json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Mailbox bulk update failed:", error.message);
    return res.status(500).json({ message: "Unable to update mailbox messages." });
  }
});

router.get("/messages/:id/attachments/:attachmentId", async (req, res) => {
  try {
    const { userId } = req.query;
    if (
      !(await validOwner(userId)) ||
      !isValidId(req.params.id) ||
      !isValidId(req.params.attachmentId)
    ) {
      return res.status(400).json({
        message: "Valid user, message, and attachment IDs are required.",
      });
    }
    const message = await MailboxMessage.findOne({
      _id: req.params.id,
      owner: userId,
    });
    const file = message?.attachments.id(req.params.attachmentId);
    if (!file) {
      return res.status(404).json({ message: "Attachment not found." });
    }
    return res.status(200).json({
      attachment: {
        _id: file._id,
        name: file.name,
        type: file.type,
        size: file.size,
        data: file.data,
      },
    });
  } catch (error) {
    console.error("Mailbox attachment download failed:", error.message);
    return res.status(500).json({ message: "Unable to download attachment." });
  }
});

router.delete("/messages/bulk", async (req, res) => {
  try {
    const { userId, ids } = req.body;
    if (
      !(await validOwner(userId)) ||
      !Array.isArray(ids) ||
      !ids.length ||
      ids.length > 500 ||
      ids.some((id) => !isValidId(id))
    ) {
      return res
        .status(400)
        .json({ message: "A valid user ID and message ID list are required." });
    }

    const result = await MailboxMessage.deleteMany({
      _id: { $in: ids },
      owner: userId,
    });
    return res.status(200).json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Mailbox message deletion failed:", error.message);
    return res
      .status(500)
      .json({ message: "Unable to delete mailbox messages." });
  }
});

module.exports = router;
