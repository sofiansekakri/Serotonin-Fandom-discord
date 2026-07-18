const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('logchannels')
        .setDescription('Sets the log channel(s)')
        .addStringOption(option => option.setName('action').setDescription('The action to perform (set, delete, view).').setRequired(true).addChoices(
            { name: 'set', value: 'set' },
            { name: 'delete', value: 'delete' },
            { name: 'view', value: 'view' }
        ))
        .addStringOption(option => option.setName('channelid').setDescription('The channel to set as the log channel.').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(String(interaction.user.id))) {
            await interaction.editReply({ content: 'You are not permitted to delete, add, and view log channels.' });
            return;
        }
        const channelId = interaction.options.getString('channelid') || false;
        if (interaction.options.getString('action') !== 'view' && !channelId) {
            await interaction.editReply({ content: 'Please provide a valid channel ID.' });
            return;
        }
        let newWhitelist = whitelist;
        if (interaction.options.getString('action') === 'set') {
            if (!newWhitelist.logChannels.includes(channelId)) {
                newWhitelist.logChannels.push(channelId);
                fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(newWhitelist, null, 2));
                await interaction.editReply({ content: `Log channel set to <#${channelId}>.` });
                return;
            }
            await interaction.editReply({ content: `Log channel <#${channelId}> is already set.` });
            return;
        }
        if (interaction.options.getString('action') === 'delete') {
            if (newWhitelist.logChannels.includes(channelId)) {
                newWhitelist.logChannels = newWhitelist.logChannels.filter(id => id !== channelId);
                fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(newWhitelist, null, 2));
                await interaction.editReply({ content: `Log channel <#${channelId}> deleted.` });
                return;
            }
        }
        if (interaction.options.getString('action') === 'view') {
            if (newWhitelist.logChannels.length > 0) {
                await interaction.editReply({ content: `Log channels:\n${newWhitelist.logChannels.map(id => `<#${id}>`).join(', ')}` });
                return;
            }
        }

        fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(newWhitelist, null, 2));
        await interaction.editReply({ content: `Log channel <#${channelId}> is not set.` });
    }
};