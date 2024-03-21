const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const Game = require('../../schemas/ss');
const shuffleParticipants = require('./shuffleParticpants')

module.exports = async (client) => {
  try {
    const games = await Game.find({});

    games.forEach(async (game) => {
      const now = new Date().getTime();

      if (now >= game.EndTimestamp && !game.Ended) {
        const channel = client.channels.cache.get(game.channel);
        const message = await channel.messages.fetch(game.MessageID).catch(() => { return });

        const firstrow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("join_ss")
            .setLabel("Join")
            .setDisabled(true)
            .setStyle(ButtonStyle.Primary)
        );

        const secrow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("leave_ss")
            .setLabel("Leave")
            .setStyle(ButtonStyle.Primary)
        );

        if (game.Participants.length < 2) {
          const embed = new EmbedBuilder()
            .setTitle("Game Ended")
            .setDescription("Not enough players to start the game.")
            .setColor("FFFFFF");
          await message.edit({ embeds: [embed], components: [firstrow] });

          game.Ended = true;
          await game.save().catch((err) => console.log(err));
        } else {
          const shuffledParticipants = shuffleParticipants(game.Participants.slice());
          const participants = shuffledParticipants.slice(0, 2);

          const embed = new EmbedBuilder()
            .setTitle("Game Started")
            .setDescription(`The game has started! Participants: <@${participants[0]}> and <@${participants[1]}>`)
            .setColor("FFFFFF");
          await message.edit({ embeds: [embed], components: [secrow] });

          game.Ended = true;
          await game.save().catch((err) => console.log(err));
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
};
