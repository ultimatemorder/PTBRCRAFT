const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const {
  requireEnv,
  requireMongoUri,
  logEnvStatus,
  getToken,
} = require("./utils/env");

logEnvStatus();
requireEnv(["TOKEN", "CLIENT_ID"]);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

async function start() {
  try {
    await mongoose.connect(requireMongoUri());
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Falha ao conectar MongoDB:", error);
    process.exit(1);
  }

  const commandFiles = fs.readdirSync(path.join(__dirname, "commands"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
  }

  const eventFiles = fs.readdirSync(path.join(__dirname, "events"));

  for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (!event.name) continue;

    client.removeAllListeners(event.name);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }

  await client.login(getToken());
}

start().catch(console.error);
