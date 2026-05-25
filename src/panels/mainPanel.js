const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = async (settings) => {
  const embed = new EmbedBuilder()
    .setColor(settings.embedColor)
    .setTitle("⚙️ Painel de Configuração")
    .setDescription("Gerencie o sistema de confissões");

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("config_confession_channel")
      .setLabel("Canal de Confissões")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("config_logs_channel")
      .setLabel("Canal de Logs")
      .setStyle(ButtonStyle.Primary),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("config_embed_color")
      .setLabel("Cor da Embed")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_title")
      .setLabel("Título")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_footer")
      .setLabel("Rodapé")
      .setStyle(ButtonStyle.Secondary),
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("config_button")
      .setLabel("Botão")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("config_roles")
      .setLabel("Cargos")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("send_confession_panel")
      .setLabel("Enviar Painel")
      .setStyle(ButtonStyle.Danger),
  );

  return {
    embeds: [embed],
    components: [row1, row2, row3],
  };
};
