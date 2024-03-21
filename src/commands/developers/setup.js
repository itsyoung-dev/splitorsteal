const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Setup = require('../../schemas/setup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the Bot')
        .addRoleOption(option =>
            option.setName('gamerole')
                .setDescription('The role required to create Split or Steal games')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('logchannel')
                .setDescription('The channel where game logs will be sent')
                .setRequired(true))
        .toJSON(),
    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const gameroleId = interaction.options.getRole('gamerole').id;
        const logChannelId = interaction.options.getChannel('logchannel').id;

        if (!interaction.user.id.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Admins+ can only use this command.', ephemeral: true });
            }
            
        await Setup.findOneAndUpdate(
            { guildId: guildId },
            { $set: { Gamerole: gameroleId, LogChannel: logChannelId } },
            { upsert: true }
        );

        await interaction.reply({content: "Thank you for setting up Split or Steal, enjoy your time using it!!!", ephemeral: true});
    }
};
