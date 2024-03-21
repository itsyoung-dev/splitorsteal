const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Game = require('../schemas/ss');
const sendPaginatedMessage = require('../utils/sendUserPagination');

module.exports = {
    customId: "participants_ss",
    userPermissions: [],
    botPermissions: [],

    run: async (client, interaction) => {
        try {
            const hostField = interaction.message.embeds[0].fields.find(field => field.name === 'Host');
            if (!hostField) {
                return await interaction.reply({ content: 'Host information not found in embed.', ephemeral: true });
            }

            const hostId = hostField.value.match(/<@!?(\d+)>/)[1];
            if (interaction.user.id !== hostId) {
                return await interaction.reply({ content: 'Only the host can view participants.', ephemeral: true });
            }

            const gameId = interaction.message.embeds[0].footer.text.replace('Game Id: ', '');
            const game = await Game.findById(gameId);

            if (!game) {
                return await interaction.reply({ content: 'Game not found.', ephemeral: true });
            }

            const participantsList = game.players.map(playerId => {
                const member = interaction.guild.members.cache.get(playerId);
                return member ? `${member.user.tag} | (${member.user.id})` : 'Unknown User';
            });

            await sendPaginatedMessage(interaction, participantsList, 5); // Show 5 participants per page

        } catch (error) {
            console.error('Error checking players:', error);
            await interaction.reply('An error occurred while processing the command.');
        }
    },
};
