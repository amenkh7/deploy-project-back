const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
  audio: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Audio || mongoose.model("Audio", audioSchema);
