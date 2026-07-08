const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-blacklist-servers')
        .setDescription('Lists all blacklisted servers')
,

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        const blacklistEmbed = new EmbedBuilder()
            .setTitle('Blacklisted Servers')
            .setDescription(whitelist.guilds.blacklist.length > 0 ? whitelist.guilds.blacklist.map(id => `\`${id}\``).join('\n') : 'No blacklisted servers.');
        await interaction.reply({ embeds: [blacklistEmbed] });
    }
    
};