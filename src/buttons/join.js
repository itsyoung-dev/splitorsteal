const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Game = require('../schemas/ss');

module.exports = {
  customId: "join_ss",
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {

    try {
      const gameId = interaction.message.embeds[0].footer.text.replace('Game Id: ', '');
      
      const game = await Game.findById(gameId);


      if (!game) {
          return await interaction.reply({content: 'Game not found.', ephemeral: true});
      }

      if (game.players.includes(interaction.user.id)) {
          return await interaction.reply({content: 'You are already in this game.', ephemeral: true});
      }

      game.players.push(interaction.user.id);
      await game.save();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('join_ss')
            .setLabel('Join')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        );

      await interaction.reply({
        content: `You have successfully joined the game. [${gameId}]`,
        ephemeral: true
      });

    } catch (error) {
      console.error('Error joining game:', error);
      await interaction.reply('An error occurred while processing the command.');
    }
  },
};
