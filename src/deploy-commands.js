const { getToken, getClientId, requireEnv } = require("./utils/env");

requireEnv(["TOKEN", "CLIENT_ID"]);

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath);

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(getToken());

(async () => {
  try {
    console.log("Registrando comandos...");

    await rest.put(Routes.applicationCommands(getClientId()), {
      body: commands,
    });

    console.log("Comandos registrados.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
