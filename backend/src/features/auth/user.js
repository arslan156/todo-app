const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    list: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List",
      },
    ],

    // Password reset: only a hash of the emailed token is stored.
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// What the API sends back about a user: never the password or reset data.
listSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("user", listSchema);
