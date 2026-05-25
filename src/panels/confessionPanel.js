const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = (settings) => {
  const embed = new EmbedBuilder()
    .setColor(settings.embedColor)
    .setTitle(settings.confessionTitle)
    .setDescription("Clique no botão abaixo para enviar uma confissão anônima.")
    .setFooter({ text: settings.footerText });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("new_confession")
      .setLabel(settings.buttonText)
      .setEmoji(settings.buttonEmoji)
      .setStyle(ButtonStyle.Primary),
  );

  return {
    embeds: [embed],
    components: [row],
  };
};
