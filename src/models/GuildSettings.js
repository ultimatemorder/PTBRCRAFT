const mongoose = require("mongoose");

module.exports = mongoose.model(
  "GuildSettings",
  new mongoose.Schema({
    guildId: String,

    confessionChannelId: String,
    logChannelId: String,

    allowedRoles: {
      type: [String],
      default: [],
    },

    embedColor: {
      type: String,
      default: "#a855f7",
    },

    footerText: {
      type: String,
      default: "Confissões Anônimas",
    },

    confessionTitle: {
      type: String,
      default: "💌 Nova Confissão",
    },

    buttonText: {
      type: String,
      default: "Nova Confissão",
    },

    buttonEmoji: {
      type: String,
      default: "🫣",
    },
  }),
);
