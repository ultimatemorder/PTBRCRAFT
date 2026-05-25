const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Counter",
  new mongoose.Schema({
    guildId: String,
    currentId: {
      type: Number,
      default: 0,
    },
  }),
);
