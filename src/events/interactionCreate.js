const buttonHandler = require("../handlers/buttonHandler");
const modalHandler = require("../handlers/modalHandler");
const selectHandler = require("../handlers/selectHandler");
const { deferEphemeral, sendEphemeral } = require("../utils/interaction");

const handledInteractions = new Set();

function interactionLabel(interaction) {
  return (
    interaction.commandName ||
    interaction.customId ||
    interaction.componentType ||
    interaction.type
  );
}

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    const label = interactionLabel(interaction);

    if (handledInteractions.has(interaction.id)) {
      console.warn(`[Interacao] duplicada ignorada: ${interaction.id} (${label})`);
      return;
    }

    handledInteractions.add(interaction.id);
    setTimeout(() => handledInteractions.delete(interaction.id), 60_000);

    console.log(`[Interacao] ${interaction.type} ${label}`);

    try {
      if (interaction.isChatInputCommand()) {
        if (!(await deferEphemeral(interaction))) {
          console.error(`[Interacao] defer falhou: ${label}`);
          return;
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) {
          return sendEphemeral(interaction, {
            content: "Comando não encontrado.",
          });
        }

        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        await buttonHandler(interaction);
        return;
      }

      if (interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu()) {
        await selectHandler(interaction);
        return;
      }

      if (interaction.isModalSubmit()) {
        if (!(await deferEphemeral(interaction))) {
          console.error(`[Interacao] defer falhou: ${label}`);
          return;
        }

        await modalHandler(interaction);
        return;
      }

      console.warn(`[Interacao] tipo não tratado: ${interaction.type}`);
      await sendEphemeral(interaction, {
        content: "Tipo de interação não suportado.",
      });
    } catch (error) {
      console.error(`[Interacao] erro em ${label}:`, error);

      await sendEphemeral(interaction, {
        content: "Ocorreu um erro ao processar essa interação.",
      });
    } finally {
      if (!interaction.replied && !interaction.deferred) {
        console.error(`[Interacao] sem resposta: ${interaction.id} (${label})`);

        await sendEphemeral(interaction, {
          content: "Não foi possível processar essa interação.",
        }).catch(() => {});
      }
    }
  },
};
