const GuildSettings = require("../models/GuildSettings");
const checkPerms = require("../utils/permissions");
const { sendEphemeral } = require("../utils/interaction");

module.exports = async (interaction) => {
  await interaction.deferUpdate();

  const allowed = await checkPerms(interaction);

  if (!allowed) {
    return interaction.editReply({
      content: "Sem permissão.",
      components: [],
    });
  }

  if (interaction.customId === "select_confession_channel") {
    const channelId = interaction.channels.first().id;

    await GuildSettings.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { confessionChannelId: channelId },
      { upsert: true },
    );

    return interaction.editReply({
      content: `Canal de confissões definido: <#${channelId}>`,
      components: [],
    });
  }

  if (interaction.customId === "select_logs_channel") {
    const channelId = interaction.channels.first().id;

    await GuildSettings.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { logChannelId: channelId },
      { upsert: true },
    );

    return interaction.editReply({
      content: `Canal de logs definido: <#${channelId}>`,
      components: [],
    });
  }

  if (interaction.customId === "select_allowed_roles") {
    const roleIds = interaction.roles.map((role) => role.id);

    await GuildSettings.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { allowedRoles: roleIds },
      { upsert: true },
    );

    const rolesText =
      roleIds.length > 0
        ? roleIds.map((id) => `<@&${id}>`).join(", ")
        : "Nenhum cargo selecionado.";

    return interaction.editReply({
      content: `Cargos permitidos atualizados: ${rolesText}`,
      components: [],
    });
  }

  await sendEphemeral(interaction, {
    content: "Seleção não reconhecida.",
  });
};
