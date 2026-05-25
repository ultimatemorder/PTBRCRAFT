const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");

const GuildSettings = require("../models/GuildSettings");
const Confession = require("../models/Confession");
const generateId = require("../utils/generateId");

module.exports.createConfession = async (interaction, message, imageUrl) => {
  const settings = await GuildSettings.findOne({
    guildId: interaction.guild.id,
  });

  if (!settings?.confessionChannelId) return null;

  const channel = interaction.guild.channels.cache.get(
    settings.confessionChannelId,
  );

  if (!channel) return null;

  const confessionId = await generateId(interaction.guild.id);

  const embed = new EmbedBuilder()
    .setColor(settings.embedColor)
    .setTitle(settings.confessionTitle)
    .setDescription(`**#${confessionId}**\n\n${message}`)
    .setFooter({ text: settings.footerText });

  if (imageUrl) {
    embed.setImage(imageUrl);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`reply_${confessionId}`)
      .setLabel("Responder")
      .setEmoji("💬")
      .setStyle(ButtonStyle.Secondary),
  );

  const sentMessage = await channel.send({
    embeds: [embed],
    components: [row],
  });

  await Confession.create({
    guildId: interaction.guild.id,
    confessionId,
    authorId: interaction.user.id,
    message,
    imageUrl,
    messageId: sentMessage.id,
    threadId: null,
  });

  return confessionId;
};

module.exports.getReplyThread = async (interaction, confession) => {
  if (confession.threadId) {
    return interaction.guild.channels.fetch(confession.threadId);
  }

  const settings = await GuildSettings.findOne({
    guildId: interaction.guild.id,
  });

  if (!settings?.confessionChannelId) return null;

  const channel = await interaction.guild.channels.fetch(
    settings.confessionChannelId,
  );

  const confessionMessage = await channel.messages.fetch(confession.messageId);

  const existingThread = confessionMessage.thread;

  const thread =
    existingThread ||
    (await confessionMessage.startThread({
      name: `💬 Respostas #${confession.confessionId}`,
      autoArchiveDuration: 1440,
      type: ChannelType.PublicThread,
    }));

  if (!confession.threadId) {
    confession.threadId = thread.id;
    await confession.save();
  }

  return thread;
};
