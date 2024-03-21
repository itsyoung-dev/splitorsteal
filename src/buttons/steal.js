const { MessageEmbed } = require('discord.js');
const Game = require('../schemas/ss');

module.exports = {
    customId: "steal_ss",
    userPermissions: [],
    botPermissions: [],

    run: async (client, interaction) => {
        const gameId = interaction.message.embeds[0].footer.text.split(' ')[2];
        const playerId = interaction.user.id;
        const choice = 'steal'; 

        
        const game = await Game.findByIdAndUpdate(
            gameId,
            { $push: { playerChoices: { userId: playerId, choice: choice } } },
            { new: true }
        );
        await game.save();

        if (!game) {
            return interaction.reply('Game not found.');
        }

        const host = game.host; 
        const hostDM = await client.users.fetch(host);
        try {
            await hostDM.send(`**Split or Steal | Game [${gameId}] **\n${interaction.user.tag} chose ${choice}\n Post the results once both players answered in <#${game.channel.id}>`);
        } catch (error) {
            console.error('Error sending message to host:', error);
        }

        await interaction.reply({ content: `Choice recorded!`, ephemeral: true});
    },
};
