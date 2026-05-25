const { SlashCommandBuilder } = require("discord.js");

const GuildSettings = require("../models/GuildSettings");
const panel = require("../panels/mainPanel");
const checkPerms = require("../utils/permissions");
const { sendEphemeral } = require("../utils/interaction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("painel")
    .setDescription("Abrir painel administrativo"),

  async execute(interaction) {
    const allowed = await checkPerms(interaction);

    if (!allowed) {
      return sendEphemeral(interaction, { content: "Sem permissão." });
    }

    let settings = await GuildSettings.findOne({
      guildId: interaction.guild.id,
    });

    if (!settings) {
      settings = await GuildSettings.create({
        guildId: interaction.guild.id,
      });
    }

    const data = await panel(settings);

    await sendEphemeral(interaction, data);
  },
};
