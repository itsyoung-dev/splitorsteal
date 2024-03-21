const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Game = require('../schemas/ss');

module.exports = {
    customId: "delete_ss",
    userPermissions: [],
    botPermissions: [],

    run: async (client, interaction) => {
        const { channel, guild } = interaction;
        const gameId = interaction.message.embeds[0].footer.text.split(' ')[2];
        const playerId = interaction.user.id;
        const game = await Game.findById(gameId);
        if (!game) {
            return interaction.reply({ content: 'Game not found.', ephemeral: true });
        }
        
        if (playerId === game.host) {
            if (interaction.channel?.type === 'GUILD_TEXT' || interaction.channel?.type === 'GUILD_PUBLIC_THREAD' || interaction.channel?.type === 'GUILD_PRIVATE_THREAD') {
                const thread = interaction.channel.threads.cache.get(game.channel);
                if (thread) {
                    await thread.delete();
                }
            }
            const choices = game.playerChoices.map(pc => `${pc.userId} chose ${pc.choice}`).join('\n');
    
            const resultEmbed = new EmbedBuilder()
                .setTitle('Split or Steal Game Ended')
                .setDescription(choices);
    

                const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("confirm")
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId("cancel")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Danger)
                )
            await interaction.reply({ content: 'Are you sure you want to delete this game? This action cannot be undone.', components: [row], ephemeral: true });
    
            const filter = (i) => i.user.id === playerId;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
    
            collector.on('collect', async (i) => {
                if (i.customId === 'confirm') {
                    await channel.setArchived(true);
                    await channel.delete();
                    if (game.channel) {
                        await game.channel.send({ embeds: [resultEmbed] });
                    }
                    await Game.findByIdAndDelete(gameId);
                    await interaction.editReply({ content: 'Game deleted.', ephemeral: true });
                    collector.stop();
                } else if (i.customId === 'cancel') {
                    await interaction.reply({ content: 'Deletion canceled.', ephemeral: true });
                    collector.stop();
                }
            });
    
            collector.on('end', async () => {
                await interaction.deleteReply();
            });
        } else {
            await interaction.reply({ content: 'You are not the host of this game.', ephemeral: true });
        }
}
}
    