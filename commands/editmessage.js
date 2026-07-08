const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editmsg')
        .setDescription('edit a message by ID')
        .addStringOption(option => option.setName('channel-id').setDescription('the ID of the channel containing the message').setRequired(true))
        .addStringOption(option => option.setName('message-id').setDescription('the ID of the message to edit').setRequired(true))
        .addStringOption(option => option.setName('content').setDescription('the new content for the message').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const channel_id = interaction.options.getString('channel-id');
        const message_id = interaction.options.getString('message-id');
        const content = interaction.options.getString('content');
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) { await interaction.editReply({content:'you are not authorized to use this command.'}); return;}
        const channel = await interaction.client.channels.fetch(channel_id).catch(() => null);
        if (!channel) {
            await interaction.editReply({ content: 'Channel not found.' });
            return;
        }
        const message = await channel.messages.fetch(message_id).catch(() => null);
        if (!message) {
            await interaction.editReply({ content: 'Message not found.' });
            return;
        }
        await message.edit({ content });
        await interaction.editReply({ content: 'Message edited successfully.' });
    }
};