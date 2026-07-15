const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('create an embed message')
        .addStringOption(option => option.setName('title').setDescription('The title of the embed').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('The description of the embed').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send the embed in').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id) && !whitelist.localConfig[interaction.guildId]?.whitelist?.main?.includes(interaction.user.id)) {
            await interaction.editReply({ content: 'You are not on the whitelist.', flags: 64 });
            return;
        }
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        if (!channel.isTextBased()) {
            return interaction.editReply({
                content: 'That channel cannot receive messages.'
            });
        }
        if (interaction.options.getString('description').length > 1999) {
            return interaction.editReply({
                content: 'Content is too large.'
            })
        }
        const embed = new EmbedBuilder()
            .setTitle(interaction.options.getString('title'))
            .setDescription(interaction.options.getString('description').replace(/<br\s*\/?>|\\n/gi, '\n'));
        await channel.send({ embeds: [embed] });
        await interaction.editReply({ content: 'done.', flags: 64 });
    }
};