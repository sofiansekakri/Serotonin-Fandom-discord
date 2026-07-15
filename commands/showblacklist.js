const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-blacklist')
        .setDescription('Lists all blacklisted users')
        .addStringOption(option => option.setName('serverid').setDescription('The server ID, empty for global blacklist').setRequired(false)),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        const serverId = interaction.options.getString('serverid') || 'global';
        const blacklist = whitelist.localConfig[String(serverId)]?.blacklist || whitelist.blacklist;
        const blacklistEmbed = new EmbedBuilder()
            .setTitle('Blacklisted Users')
            .setDescription(blacklist.length > 0 ? blacklist.map(id => `<@${id}>`).join('\n') : 'No blacklisted users.');
        await interaction.reply({ embeds: [blacklistEmbed] });
    }
    
};