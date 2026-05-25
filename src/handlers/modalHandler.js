const GuildSettings = require("../models/GuildSettings");
const {
  createConfession,
  getReplyThread,
} = require("../services/confessionService");
const Confession = require("../models/Confession");
const checkPerms = require("../utils/permissions");
const { sendEphemeral } = require("../utils/interaction");

const pendingConfessions = new Set();

async function saveConfig(interaction, update, successMessage) {
  const allowed = await checkPerms(interaction);

  if (!allowed) {
    return sendEphemeral(interaction, { content: "Sem permissão." });
  }

  await GuildSettings.findOneAndUpdate(
    { guildId: interaction.guild.id },
    update,
    { upsert: true },
  );

  return sendEphemeral(interaction, { content: successMessage });
}

module.exports = async (interaction) => {
  if (interaction.customId === "confession_modal") {
    const pendingKey = `${interaction.guild.id}:${interaction.user.id}`;

    if (pendingConfessions.has(pendingKey)) {
      return sendEphemeral(interaction, {
        content: "Sua confissão já está sendo enviada. Aguarde.",
      });
    }

    pendingConfessions.add(pendingKey);

    try {
      const message = interaction.fields.getTextInputValue("confession_message");
      const image = interaction.fields.getTextInputValue("confession_image");

      const id = await createConfession(interaction, message, image);

      if (!id) {
        return sendEphemeral(interaction, {
          content: "Canal de confissões não configurado.",
        });
      }

      return sendEphemeral(interaction, {
        content: `Confissão enviada (#${id})`,
      });
    } finally {
      pendingConfessions.delete(pendingKey);
    }
  }

  if (interaction.customId.startsWith("reply_modal_")) {
    const confessionId = interaction.customId.split("_")[2];

    const confession = await Confession.findOne({
      guildId: interaction.guild.id,
      confessionId,
    });

    if (!confession) {
      return sendEphemeral(interaction, {
        content: "Confissão não encontrada.",
      });
    }

    const message = interaction.fields.getTextInputValue("reply_message");

    const thread = await getReplyThread(interaction, confession);

    if (!thread) {
      return sendEphemeral(interaction, {
        content: "Não foi possível abrir o tópico de respostas.",
      });
    }

    await thread.send({
      content: `💬 Resposta Anônima\n\n${message}`,
    });

    return sendEphemeral(interaction, {
      content: "Resposta enviada.",
    });
  }

  if (interaction.customId === "config_embed_color_modal") {
    const color = interaction.fields.getTextInputValue("color_value");

    return saveConfig(
      interaction,
      { embedColor: color },
      `Cor atualizada para \`${color}\`.`,
    );
  }

  if (interaction.customId === "config_title_modal") {
    const title = interaction.fields.getTextInputValue("title_value");

    return saveConfig(
      interaction,
      { confessionTitle: title },
      `Título atualizado para **${title}**.`,
    );
  }

  if (interaction.customId === "config_footer_modal") {
    const footer = interaction.fields.getTextInputValue("footer_value");

    return saveConfig(
      interaction,
      { footerText: footer },
      `Rodapé atualizado para **${footer}**.`,
    );
  }

  if (interaction.customId === "config_button_modal") {
    const buttonText = interaction.fields.getTextInputValue("button_text");
    const buttonEmoji =
      interaction.fields.getTextInputValue("button_emoji") || "🫣";

    return saveConfig(
      interaction,
      { buttonText, buttonEmoji },
      `Botão atualizado: ${buttonEmoji} **${buttonText}**.`,
    );
  }

  await sendEphemeral(interaction, {
    content: "Modal não reconhecido.",
  });
};
