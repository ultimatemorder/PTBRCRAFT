const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../../.env");

if (!fs.existsSync(envPath)) {
  console.error(`Arquivo .env não encontrado: ${envPath}`);
  process.exit(1);
}

require("dotenv").config({ path: envPath, override: true });

function getToken() {
  return process.env.TOKEN;
}

function getClientId() {
  return process.env.CLIENT_ID;
}

function sanitizeMongoUri(uri) {
  if (!uri) return null;

  let value = uri.trim();

  const match = value.match(/mongodb(\+srv)?:\/\/\S+/);
  if (match) return match[0].split("?")[0];

  return value.split("?")[0];
}

function getMongoUri() {
  return sanitizeMongoUri(process.env.MONGO_URI);
}

function logEnvStatus() {
  const uri = getMongoUri();

  console.log("Config carregado apenas de .env");
  console.log("Variáveis detectadas:", {
    TOKEN: Boolean(getToken()),
    CLIENT_ID: Boolean(getClientId()),
    MONGO_URI: Boolean(uri),
  });
}

function requireEnv(keys) {
  const missing = keys.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logEnvStatus();
    console.error(`Variáveis ausentes no .env: ${missing.join(", ")}`);
    process.exit(1);
  }
}

function requireMongoUri() {
  const uri = getMongoUri();

  if (!uri?.startsWith("mongodb://") && !uri?.startsWith("mongodb+srv://")) {
    logEnvStatus();
    console.error("MONGO_URI inválida ou ausente no .env");
    process.exit(1);
  }

  return uri;
}

module.exports = {
  requireEnv,
  requireMongoUri,
  logEnvStatus,
  getToken,
  getClientId,
};
