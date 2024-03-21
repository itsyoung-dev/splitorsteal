const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Game = require('../schemas/ss');

module.exports = {
  customId: "leave_ss",
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {

    try {
      const gameId = interaction.message.embeds[0].footer.text.replace('Game Id: ', '');
      
      const game = await Game.findById(gameId);

    if (!game) {
        return await interaction.reply({content: 'Game not found.', ephemeral: true});
    }

    const playerIndex = game.players.indexOf(interaction.user.id);
    if (playerIndex === -1) {
        return await interaction.reply({content: 'You are not in this game.', ephemeral: true});
    }

    game.players.splice(playerIndex, 1);
    await game.save();

    await interaction.reply({
      content: 'You have successfully left the game.',
      ephemeral: true
    });

} catch (error) {
    console.error(error);
    await interaction.reply('An error occurred while processing the command.');
  }
  },
};
