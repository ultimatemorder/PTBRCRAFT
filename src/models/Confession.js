const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Confession",
  new mongoose.Schema({
    guildId: String,
    confessionId: Number,
    authorId: String,
    message: String,
    imageUrl: String,
    messageId: String,
    threadId: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }),
);
