const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('send a direct message')
        .addStringOption(option => option.setName('message').setDescription('The message to send').setRequired(true))
        .addUserOption(option => option.setName('user').setDescription('The user to send the message to').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) { await interaction.editReply({content:'nope', flags: 64}); return;}
        const user = interaction.options.getUser('user');
        await user.send(interaction.options.getString('message'));
        await interaction.editReply({ content: 'done.', flags: 64 });
    }
};