const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (interaction, items, itemsPerPage) => {
    try {
        if (items.length <= itemsPerPage) {
            return await interaction.reply({
                content: `Participants:\n${items.join('\n')}`,
                ephemeral: true
            });
        }

        const pages = [];
        for (let i = 0; i < items.length; i += itemsPerPage) {
            const pageContent = items.slice(i, i + itemsPerPage).join('\n');
            pages.push(pageContent);
        }

        const prev = new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const home = new ButtonBuilder()
            .setCustomId('home')
            .setLabel('Home')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const next = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary);

        const Buttons = new ActionRowBuilder().addComponents([prev, home, next]);
        let index = 0;

        const cp = await interaction.reply({
            content: `Participants:\n${pages[index]}`,
            ephemeral: true,
            components: [Buttons],
        });

        const mc = await cp.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 60000,
        });

        mc.on('collect', async (i) => {
            if (i.customId === 'prev' && index > 0) {
                index--;
            } else if (i.customId === 'next' && index < pages.length - 1) {
                index++;
            }

            prev.setDisabled(index === 0);
            next.setDisabled(index === pages.length - 1);

            await cp.edit({
                content: `Participants:\n${pages[index]}`,
                components: [Buttons],
            });

            await i.deferUpdate();
        });

        mc.on('end', async () => {
            await cp.edit({
                content: `Participants:\n${pages[index]}`,
                components: [],
            });
        });

    } catch (error) {
        console.error(error);
    }
};
