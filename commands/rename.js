const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Renames an user.')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to rename.').setRequired(true))
            .addStringOption(option => option.setName('nickname').setDescription('The new name for the user.').setRequired(true)
        ),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) {
            await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
            return;
        }
        const user = interaction.options.getUser('user');
        const newName = interaction.options.getString('nickname');
        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            await interaction.reply({ content: 'User not found in this server.' });
            return;
        }
        await member.setNickname(newName);
        await interaction.reply({ content: `User renamed to ${newName}.`});
    }
}