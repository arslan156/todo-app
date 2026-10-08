const router = require("express").Router();
const { ensureSelfParam } = require("../auth/requireAuth");
const mongoose = require("mongoose");
const User = require("../auth/user");
const Conversation = require("./conversation");
const Message = require("./message");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const conversationForMember = async (conversationId, userId) => {
  if (!isValidId(conversationId) || !isValidId(userId)) return null;
  return Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
};

// A userId in the URL must be the signed-in user.
router.param("userId", ensureSelfParam);

router.get("/conversations/:userId", async (req, res) => {
  try {
    if (!isValidId(req.params.userId)) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }

    const userExists = await User.exists({ _id: req.params.userId });
    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    const conversations = await Conversation.find({
      participants: req.params.userId,
    })
      .populate("participants", "username email")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Conversation list failed:", error.message);
    return res.status(500).json({ message: "Unable to load conversations." });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const userId = req.body.userId;
    const recipientEmail =
      typeof req.body.recipientEmail === "string"
        ? req.body.recipientEmail.trim()
        : "";

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }
    if (!recipientEmail || !recipientEmail.includes("@")) {
      return res.status(400).json({ message: "Enter a valid account email." });
    }

    const currentUser = await User.findById(userId).select("_id");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const escapedEmail = recipientEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const recipient = await User.findOne({
      email: new RegExp(`^${escapedEmail}$`, "i"),
    }).select("_id");

    if (!recipient) {
      return res.status(404).json({
        message: "No account is registered with that email.",
      });
    }
    if (recipient._id.equals(currentUser._id)) {
      return res.status(400).json({
        message: "You cannot start a conversation with yourself.",
      });
    }

    const participantIds = [currentUser._id, recipient._id].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );
    const directKey = participantIds.map((id) => id.toString()).join(":");

    let conversation;
    try {
      conversation = await Conversation.findOneAndUpdate(
        { directKey },
        {
          $setOnInsert: {
            directKey,
            participants: participantIds,
            lastMessageAt: new Date(0),
          },
        },
        { upsert: true, returnDocument: "after", runValidators: true }
      ).populate("participants", "username email");
    } catch (error) {
      if (error.code !== 11000) throw error;
      conversation = await Conversation.findOne({ directKey }).populate(
        "participants",
        "username email"
      );
    }

    return res.status(200).json({ conversation });
  } catch (error) {
    console.error("Conversation creation failed:", error.message);
    return res.status(500).json({ message: "Unable to start conversation." });
  }
});

router.get("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const userId = req.query.userId;
    const conversation = await conversationForMember(
      req.params.conversationId,
      userId
    );
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit =
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 100;

    const recentMessages = await Message.find({
      conversation: conversation._id,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "username")
      .lean();

    await Message.updateMany(
      {
        _id: { $in: recentMessages.map((message) => message._id) },
        conversation: conversation._id,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } }
    );

    return res.status(200).json({ messages: recentMessages.reverse() });
  } catch (error) {
    console.error("Message loading failed:", error.message);
    return res.status(500).json({ message: "Unable to load messages." });
  }
});

router.post("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const userId = req.body.userId;
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }
    if (!text) {
      return res.status(400).json({ message: "Message text is required." });
    }
    if (text.length > 5000) {
      return res.status(400).json({
        message: "Messages must be 5000 characters or fewer.",
      });
    }

    const conversation = await conversationForMember(
      req.params.conversationId,
      userId
    );
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: userId,
      text,
      readBy: [userId],
    });

    await Conversation.updateOne(
      { _id: conversation._id, participants: userId },
      {
        $set: {
          lastMessageAt: message.createdAt,
          lastMessage: {
            text,
            sender: userId,
            sentAt: message.createdAt,
          },
        },
      }
    );

    await message.populate("sender", "username");
    return res.status(201).json({ message });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Message send failed:", error.message);
    return res.status(500).json({ message: "Unable to send message." });
  }
});

module.exports = router;
