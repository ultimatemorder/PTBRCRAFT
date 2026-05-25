const { PermissionFlagsBits } = require("discord.js");
const GuildSettings = require("../models/GuildSettings");

module.exports = async (interaction) => {
  if (
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
  ) {
    return true;
  }

  const settings = await GuildSettings.findOne({
    guildId: interaction.guild.id,
  });

  if (!settings?.allowedRoles?.length) return false;

  const roles = interaction.member?.roles?.cache;
  if (!roles) return false;

  return roles.some((role) => settings.allowedRoles.includes(role.id));
};
