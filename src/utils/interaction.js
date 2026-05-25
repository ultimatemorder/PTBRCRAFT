const { MessageFlags } = require("discord.js");

async function deferEphemeral(interaction) {
  if (interaction.deferred || interaction.replied) return true;

  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    return true;
  } catch (error) {
    if (error.code === 10062 || error.code === 40060) {
      console.warn(`deferReply falhou (${error.code})`);
      return false;
    }
    throw error;
  }
}

async function sendEphemeral(interaction, payload) {
  try {
    if (interaction.deferred) {
      return interaction.editReply(payload);
    }

    if (interaction.replied) {
      return interaction.followUp({
        ...payload,
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.reply({
      ...payload,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    if (error.code === 10062 || error.code === 40060) return null;
    throw error;
  }
}

module.exports = { deferEphemeral, sendEphemeral };
