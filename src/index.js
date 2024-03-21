require('dotenv/config');
const { Client, GatewayIntentBits } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

eventHandler(client);

// Login to Discord
client.login(process.env.DISCORD_TOKEN);