const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    body: {
      type: String,
      default: "",
      maxlength: 4000,
    },
    tag: {
      type: String,
      enum: ["personal", "work", "social"],
      default: "personal",
    },
    favourite: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      enum: ["blue", "white", "amber", "sky", "green"],
      default: "white",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

noteSchema.index({ owner: 1, updatedAt: -1 });

module.exports = mongoose.model("Note", noteSchema);
