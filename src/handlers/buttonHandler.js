const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelType,
} = require("discord.js");

const GuildSettings = require("../models/GuildSettings");
const confessionPanel = require("../panels/confessionPanel");
const checkPerms = require("../utils/permissions");
const { deferEphemeral, sendEphemeral } = require("../utils/interaction");

async function requireAdmin(interaction) {
  await deferEphemeral(interaction);

  const allowed = await checkPerms(interaction);

  if (!allowed) {
    await sendEphemeral(interaction, { content: "Sem permissão." });
    return false;
  }

  return true;
}

module.exports = async (interaction) => {
  if (interaction.customId === "new_confession") {
    const modal = new ModalBuilder()
      .setCustomId("confession_modal")
      .setTitle("Nova Confissão");

    const confessionInput = new TextInputBuilder()
      .setCustomId("confession_message")
      .setLabel("Sua confissão")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const imageInput = new TextInputBuilder()
      .setCustomId("confession_image")
      .setLabel("URL da imagem/gif")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(confessionInput),
      new ActionRowBuilder().addComponents(imageInput),
    );

    return interaction.showModal(modal);
  }

  if (interaction.customId.startsWith("reply_")) {
    const confessionId = interaction.customId.split("_")[1];

    const modal = new ModalBuilder()
      .setCustomId(`reply_modal_${confessionId}`)
      .setTitle(`Resposta #${confessionId}`);

    const replyInput = new TextInputBuilder()
      .setCustomId("reply_message")
      .setLabel("Sua resposta")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(replyInput));

    return interaction.showModal(modal);
  }

  if (interaction.customId === "config_embed_color") {
    const modal = new ModalBuilder()
      .setCustomId("config_embed_color_modal")
      .setTitle("Cor da Embed");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("color_value")
          .setLabel("Cor em hexadecimal")
          .setPlaceholder("#a855f7")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(7),
      ),
    );

    return interaction.showModal(modal);
  }

  if (interaction.customId === "config_title") {
    const modal = new ModalBuilder()
      .setCustomId("config_title_modal")
      .setTitle("Título da Confissão");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("title_value")
          .setLabel("Título")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100),
      ),
    );

    return interaction.showModal(modal);
  }

  if (interaction.customId === "config_footer") {
    const modal = new ModalBuilder()
      .setCustomId("config_footer_modal")
      .setTitle("Rodapé");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("footer_value")
          .setLabel("Texto do rodapé")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100),
      ),
    );

    return interaction.showModal(modal);
  }

  if (interaction.customId === "config_button") {
    const modal = new ModalBuilder()
      .setCustomId("config_button_modal")
      .setTitle("Botão de Confissão");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("button_text")
          .setLabel("Texto do botão")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(80),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("button_emoji")
          .setLabel("Emoji do botão")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setMaxLength(10),
      ),
    );

    return interaction.showModal(modal);
  }

  if (interaction.customId === "config_confession_channel") {
    if (!(await requireAdmin(interaction))) return;

    const row = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId("select_confession_channel")
        .setPlaceholder("Selecione o canal de confissões")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
    );

    return sendEphemeral(interaction, {
      content: "Selecione o canal de confissões:",
      components: [row],
    });
  }

  if (interaction.customId === "config_logs_channel") {
    if (!(await requireAdmin(interaction))) return;

    const row = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId("select_logs_channel")
        .setPlaceholder("Selecione o canal de logs")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
    );

    return sendEphemeral(interaction, {
      content: "Selecione o canal de logs:",
      components: [row],
    });
  }

  if (interaction.customId === "config_roles") {
    if (!(await requireAdmin(interaction))) return;

    const row = new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId("select_allowed_roles")
        .setPlaceholder("Selecione os cargos permitidos")
        .setMinValues(0)
        .setMaxValues(25),
    );

    return sendEphemeral(interaction, {
      content: "Selecione os cargos que podem usar o painel:",
      components: [row],
    });
  }

  if (interaction.customId === "send_confession_panel") {
    if (!(await requireAdmin(interaction))) return;

    const settings = await GuildSettings.findOne({
      guildId: interaction.guild.id,
    });

    if (!settings?.confessionChannelId) {
      return sendEphemeral(interaction, {
        content: "Configure o canal de confissões antes de enviar o painel.",
      });
    }

    const channel = await interaction.guild.channels.fetch(
      settings.confessionChannelId,
    );

    if (!channel) {
      return sendEphemeral(interaction, {
        content: "Canal de confissões não encontrado. Configure novamente.",
      });
    }

    await channel.send(confessionPanel(settings));

    return sendEphemeral(interaction, {
      content: `Painel enviado em <#${channel.id}>.`,
    });
  }

  await sendEphemeral(interaction, {
    content: "Botão não reconhecido.",
  });
};
