const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Blacklists a user from using the bot')
        .addUserOption(option => option.setName('user').setDescription('The user to blacklist').setRequired(true))
        .addStringOption(option => option.setName('action').setDescription('remove or add').setRequired(true).addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' }))
        .addStringOption(option => option.setName('serverid').setDescription('The server ID, empty for global blacklist').setRequired(false)),

    async execute(interaction) {
        let whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(String(interaction.user.id)) && !whitelist.localConfig[String(interaction.guildId)].main.includes(String(interaction.user.id))) {
            await interaction.reply({ content: 'You are not permitted to blacklist users.' });
            return;
        }
        const user = interaction.options.getUser('user');
        const action = interaction.options.getString('action');
        const serverId = interaction.options.getString('serverid');
        let blacklist;
	    if (whitelist.main.includes(user.id)) { 
            await interaction.reply('that person is globally whitelisted, cannot blacklist.'); 
            return; 
        }
        if (serverId) {
            blacklist = whitelist.localConfig[String(serverId)].blacklist;
        } else {
            if (!whitelist.main.includes(String(interaction.user.id))) {
                await interaction.reply({ content: 'You are not permitted to edit the global blacklist.' });
                return;
            }
            blacklist = whitelist.blacklist;
        }

        if (action === 'add') {
            if (blacklist.includes(String(user.id))) {
                await interaction.reply({ content: 'That user is already blacklisted.' });
                return;
            }
            blacklist.push(String(user.id));
        } else if (action === 'remove') {
            if (!blacklist.includes(String(user.id))) {
                await interaction.reply({ content: 'That user is not blacklisted.' });
                return;
            }
            blacklist.splice(blacklist.indexOf(String(user.id)), 1);
        }
        if (serverId) {
            whitelist.localConfig[String(serverId)].blacklist = blacklist;
        } else {
            whitelist.blacklist = blacklist;
        }
        fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(whitelist, null, 2));
        await interaction.reply({ content: `User ${user.tag} has been ${action === 'add' ? 'blacklisted' : 'removed from the blacklist'} ${serverId ? `locally` : `globally`}.` });
    }
};
