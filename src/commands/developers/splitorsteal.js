require('dotenv/config');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const Game = require('../../schemas/ss');
const moment = require('moment');
const fetch = require('node-fetch');
const Setup = require('../../schemas/setup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('splitsteal')
        .setDescription('Start or join a Split or Steal game.')
                .addStringOption(option =>
                    option.setName('prize')
                        .setDescription('The prize for the game.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('time')
                        .setDescription('The time limit for joining in minutes.')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send the embed.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText))
                .addStringOption(option =>
                          option.setName('image')
                              .setDescription('The image url for the game.')
                              .setRequired(true))
                .addStringOption(option =>
                          option.setName('color')
                              .setDescription('The color of the embed.')
                              .addChoices(
                                  { name: 'Red', value: 'Red' },
                                  { name: 'Blue', value: 'Blue' },
                                  { name: 'Green', value: 'Green' },
                                  { name: 'Orange', value: 'Orange' },
                                  { name: 'Purple', value: 'Purple' },
                                  { name: 'Yellow', value: 'Yellow' },
                                  { name: 'Black', value: 'Black' },
                                  { name: 'White', value: 'White' },
                                  { name: 'Brown', value: 'Brown' },
                                  { name: 'Aqua', value: 'Aqua' },
                              )
                              .setRequired(true)
                      )               
        .toJSON(),
    run: async (client, interaction) => {

        try {

            const setup = await Setup.findOne({ guildId: interaction.guild.id });
            if (!setup) {
                return interaction.reply({ content: 'You need to set up Split or Steal first. Use /setup to configure.', ephemeral: true });
            }

            const gameroleId = setup.Gamerole; 
            const logChannelId = setup.LogChannel;

            const member = interaction.guild.members.cache.get(interaction.user.id); 
            if (!member.roles.cache.has(gameroleId)) {
            return interaction.reply({ content: 'You must have the required role to use this command.', ephemeral: true });
            }

  
              const gameprize = interaction.options.getString('prize');
              const duration = interaction.options.getInteger('time');
              const channel = interaction.options.getChannel('channel');
              const color = interaction.options.getString('color');
              const image = interaction.options.getString('image');
              const timeInMilliseconds = duration * 60000;
              const endTimestamp = Date.now() + timeInMilliseconds;              


              const game = new Game({
                _id: interaction.id,
                host: interaction.user.id,
                prize: gameprize,
                duration: duration,
                channel: channel.id,
                players: [],
                playerChoices: [],
                extraJoins: [],
            });
            await game.save();
             
  
              let embed = new EmbedBuilder()
                  .setTitle("Split or Steal")
                  .addFields(
                      { name: `Host`, value: `<@${interaction.user.id}>`, inline: true },
                      { name: `Prize`, value: `${gameprize}`, inline: true },
                      { name: `Duration`, value: `Starts <t:${Math.floor(endTimestamp / 1000)}:R>`, inline: true },
                  )
                  .setFooter({ text: `Game Id: ${game._id}` })
                  .setTimestamp();
  
              embed.setImage(image);
              embed.setColor(color); 
  
              const row = new ActionRowBuilder()
                  .addComponents(
                      new ButtonBuilder()
                          .setCustomId("join_ss")
                          .setLabel("Join")
                          .setStyle(ButtonStyle.Primary),
  
                      new ButtonBuilder()
                          .setCustomId("leave_ss")
                          .setLabel("Leave")
                          .setStyle(ButtonStyle.Danger),
  
                      new ButtonBuilder()
                          .setCustomId('participants_ss')
                          .setLabel('Participants')
                          .setStyle(ButtonStyle.Success),
                  );
  
              const logImage = "https://images-ext-1.discordapp.net/external/hhkIUVZZWWyn112ZRcu4teSZTLZmU6Wok-TfFwtf_Bs/https/media.tenor.com/t9EPj9L6ePoAAAPo/clouds-log.mp4"

              const logembed = new EmbedBuilder()
              .setTitle("Logs | Split or Steal was Created")
              .addFields(
                  { name: `Creator:`, value: `<@${interaction.user.id}>`, inline: false },
                  { name: `The Prize:`, value: `${gameprize}`, inline: false },
                  { name: `Duration:`, value: `Starts <t:${Math.floor(endTimestamp / 1000)}:R>`, inline: false },
              )
              .setFooter({ text: `The Game Id: ${game._id}` })
              .setTimestamp();
          
             logembed.setImage(logImage);
             logembed.setColor(color);

              const guild = interaction.guild;
              const gamechannelId = channel.id;
              const LogChannel = guild.channels.cache.get(logChannelId);
              const gameChannel = guild.channels.cache.get(gamechannelId);
              const failImage = "https://www.pngplay.com/wp-content/uploads/6/Round-Fail-Stamp-PNG-Clipart-Background.png"
              await LogChannel.send({ embeds: [logembed] });
              const message = await gameChannel.send({ embeds: [embed], components: [row] });
              const startImage = "https://media.discordapp.net/attachments/1219262657039962284/1219702184762146846/gamestart.jpg?ex=660c432d&is=65f9ce2d&hm=d885688d33b5bee44b094ccb482f99e36c0525b61f35265eef9cde362e12d37f&=&format=webp&width=525&height=525"
              await interaction.reply(`Game created! Sent Game embed to: <#${channel.id}>`);
              //Logging


              const checkTimer = async () => {
                const remainingTime = endTimestamp - Date.now();
            
                if (remainingTime <= 0) {
                    const game = await Game.findById(interaction.id); 
            
                    if (game.players.length < 2) {
                        const failedEmbed = new EmbedBuilder()
                            .setTitle("Split or Steal | Game Failed")
                            .setDescription("Failed to start due to not enough players joining. Need at least 2 players.")
                            .setFooter({ text: `Game Id: ${game._id}` })
                            .setTimestamp();
            
                        failedEmbed.setImage(failImage);
                        failedEmbed.setColor(color);
            
                        const failrow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('participants_ss')
                                    .setLabel('Participants')
                                    .setStyle(ButtonStyle.Secondary),
                            );
            
                        await message.edit({ embeds: [failedEmbed], components: [failrow] });
                        return;
                    }
                    const shuffledPlayers = game.players.sort(() => Math.random() - 0.5);
                    const [player1, player2] = shuffledPlayers.slice(0, 2);
                    const newembed = new EmbedBuilder()
                        .setTitle("Split or Steal | Game Started")
                        .addFields(
                            { name: `Host`, value: `<@${interaction.user.id}>`, inline: true },
                            { name: `Prize`, value: `${gameprize}`, inline: true },
                            { name: `Player 1:`, value: `<@${player1}> | ${player1}`, inline: false },
                            { name: `Player 2:`, value: `<@${player2}> | ${player2}`, inline: false },
                        )
                        .setFooter({ text: `Game Id: ${game._id}` })
                        .setTimestamp();
            
                    newembed.setImage(startImage);
                    newembed.setColor(color);
            
                    const secrow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('participants_ss')
                                .setLabel('Participants')
                                .setStyle(ButtonStyle.Secondary),
                        );
            
                    await message.edit({ embeds: [newembed], components: [secrow] });
                    const thread = await gameChannel.threads.create({
                        name: `Split or Steal Game Thread`,
                        autoArchiveDuration: 60,
                        type: 12, 
                        reason: 'Game thread for Split or Steal game',
                    });
                    
                    await thread.members.add(interaction.user.id);
                    await thread.members.add(player1);
                    await thread.members.add(player2);
                    
                    const gameEmbed = new EmbedBuilder()
                    .setTitle("Split or Steal | Pick Options")
                    .addFields(
                        { name: `Host`, value: `<@${interaction.user.id}>`, inline: true },
                        { name: `Prize`, value: `${gameprize}`, inline: true },
                        { name: `Player 1:`, value: `<@${player1}> | ${player1}`, inline: false },
                        { name: `Player 2:`, value: `<@${player2}> | ${player2}`, inline: false },
                    )
                    .setFooter({ text: `Game Id: ${game._id}` })
                    .setTimestamp();
        
                    gameEmbed.setImage(image);
                    gameEmbed.setColor(color);

                    const gamerow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('split_ss')
                            .setLabel('Split')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                             .setCustomId('or_ss')
                            .setLabel('Or')
                            .setDisabled(true)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('steal_ss')
                            .setLabel('Steal')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('delete_ss')
                            .setLabel('Delete Thread')
                            .setStyle(ButtonStyle.Primary),
                    );

                    await thread.send({ content: `<@${game.host}> Please check your DM's for results | ${player1}, ${player2} Choose options now`, embeds: [gameEmbed], components: [gamerow]});                    
                } else {
                    setTimeout(checkTimer, remainingTime);
                }

            };
            
            await checkTimer();
          

      } catch (error) {
          console.error(error);
          await interaction.reply('An error occurred while processing the command.');
      }

  
  }
}