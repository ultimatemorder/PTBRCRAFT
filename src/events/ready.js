const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const { getToken, getClientId } = require("../utils/env");

module.exports = {
  name: "clientReady",
  once: true,

  async execute(client) {
    console.log(`${client.user.tag} online.`);

    const clientId = getClientId();
    const token = getToken();

    if (!clientId || !token) {
      console.warn(
        "CLIENT_ID ou TOKEN ausente - rode npm run deploy ou configure no painel.",
      );
      return;
    }

    try {
      const commands = [];
      const commandsPath = path.join(__dirname, "../commands");

      for (const file of fs.readdirSync(commandsPath)) {
        const command = require(path.join(commandsPath, file));
        if (command.data) commands.push(command.data.toJSON());
      }

      const rest = new REST({ version: "10" }).setToken(token);

      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });

      console.log(`Comandos slash registrados (${commands.length}).`);
    } catch (error) {
      console.error("Falha ao registrar comandos:", error);
    }
  },
};
