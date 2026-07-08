const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklistserver')
        .setDescription('Blacklists a server from using the bot')
        .addStringOption(option => option.setName('serverid').setDescription('The server ID to blacklist').setRequired(true))
        .addStringOption(option => option.setName('action').setDescription('remove or add').setRequired(true).addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' })),

    async execute(interaction) {
        let whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(String(interaction.user.id))) {
            await interaction.reply({ content: 'You are not permitted to blacklist a server.' });
            return;
        }
        const action = interaction.options.getString('action');
        const serverId = interaction.options.getString('serverid');
        let blacklist = whitelist.guilds.blacklist;
        if (action === 'add') {
            if (blacklist.includes(String(serverId))) {
                await interaction.reply({ content: 'That server is already blacklisted.' });
                return;
            }
            blacklist.push(String(serverId));
        } else if (action === 'remove') {
            if (!blacklist.includes(String(serverId))) {
                await interaction.reply({ content: 'That server is not blacklisted.' });
                return;
            }
            blacklist.splice(blacklist.indexOf(String(serverId)), 1);
        }
        whitelist.guilds.blacklist = blacklist;
        fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(whitelist, null, 2));
        await interaction.reply({ content: `Server ${serverId} has been ${action === 'add' ? 'blacklisted' : 'removed from the blacklist'}.` });
    }
};