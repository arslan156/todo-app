const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct"],
      default: "direct",
    },
    directKey: {
      type: String,
      required: true,
      unique: true,
    },
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
      ],
      validate: {
        validator: (participants) =>
          participants.length === 2 &&
          participants[0].toString() !== participants[1].toString(),
        message: "A direct conversation needs two different participants.",
      },
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessage: {
      text: {
        type: String,
        default: "",
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      sentAt: Date,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
