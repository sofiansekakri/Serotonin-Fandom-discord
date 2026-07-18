const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('dellocal')
        .setDescription('Deletes a local config for the server')
        .addStringOption(option => option.setName('serverid').setDescription('The ID of the server to delete the local config for.').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(String(interaction.user.id)) && !(interaction.guildOwnerId === interaction.user.id)) {
            await interaction.editReply({ content: 'You are not permitted to delete local configs.' });
            return;
        }
        const serverId = interaction.options.getString('serverid') || interaction.guildId;
        let config = whitelist;
        if (config.localConfig[String(serverId)] !== undefined) {
            delete config.localConfig[String(serverId)];
        } else {
            await interaction.editReply({ content: `Server ID ${serverId} does not have a local config to delete.` });
            return;
        }

        fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(config, null, 2));
        await interaction.editReply({ content: `Local config for server ${serverId} deleted successfully.` });
    }
};