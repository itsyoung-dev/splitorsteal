const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle, ComponentType } = require("discord.js");

module.exports = async (interaction, pages, time = 30000) => {
  try {
    if (!interaction || !pages || !(pages.length > 0))
      throw new Error("Please check your parameters.");

    await interaction.deferReply();

    if (pages.length === 1) {
      return await interaction.editReply({
        embeds: [pages[0]], // Make sure to pass a single Embed object
        components: [],
        fetchReply: true,
      });
    }

    const prev = new ButtonBuilder()
    .setCustomId('prev')
    .setEmoji({ name: 'leftarrow', id: '1168201955663953991' }) 
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true);
  
  const home = new ButtonBuilder()
    .setCustomId('home')
    .setEmoji({ name: 'barhome', id: '1168202630451966125' }) 
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);
  
  const next = new ButtonBuilder()
    .setCustomId('next')
    .setEmoji({ name: 'rightarrow', id: '1168201953155752047' }) 
    .setStyle(ButtonStyle.Primary);
  
  const Buttons = new ActionRowBuilder().addComponents([prev, home, next]); index = 0;

    const cp = await interaction.editReply({
      embeds: [pages[index]],
      components: [Buttons],
      fetchReply: true,
    });

    const mc = await cp.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });

    mc.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "This button is only able to be used by the Author.",
          ephemeral: true,
        });
      }

      await i.deferUpdate({});

      if (i.customId === "prev") {
        if (index > 0) index--;
      } else if (i.customId === "home") {
        index = 0;
      } else if (i.customId === "next") {
        if (index < pages.length - 1) index++;
      }

      if (index === 0) {
        prev.setDisabled(true);
      } else prev.setDisabled(false);

      if (index === 0) {
        prev.setDisabled(true);
      } else prev.setDisabled(false);

      if (index === 0) {
        home.setDisabled(true);
      } else home.setDisabled(false);

      if (index === pages.length - 1) {
        next.setDisabled(true);
      } else next.setDisabled(false);

      await cp.edit({
        embeds: [pages[index]],
        components: [Buttons],
      });

      mc.resetTimer();
    });

    mc.on("end", async (i) => {
      await cp.edit({
        embeds: [pages[index]],
        components: [],
      });
    });

    return cp;
  } catch (err) {
    console.error(err);
  }
};
