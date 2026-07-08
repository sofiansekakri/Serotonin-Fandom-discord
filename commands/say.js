const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('echo your message')
        .addStringOption(option => option.setName('message').setDescription('The message to echo').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send the message in').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id) && !whitelist.localConfig[interaction.guildId]?.whitelist?.main?.includes(interaction.user.id) && !whitelist.cmod.includes(interaction.user.id) && !whitelist.localConfig[interaction.guildId]?.whitelist?.cmod?.includes(interaction.user.id) && !whitelist.localConfig[interaction.guildId]?.whitelist?.rollback?.includes(interaction.user.id) && !whitelist.rollback.includes(interaction.user.id)) {
            await interaction.editReply({ content: 'You are not on the whitelist.', flags: 64 });
            return;
        }
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        await channel.send(interaction.options.getString('message'));
        await interaction.editReply({ content: 'done.', flags: 64 });
    }
};