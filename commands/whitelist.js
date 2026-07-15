const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('returns the whitelist'),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        let str = `**Maintainer**\n<@${whitelist.maintainer}>\n\n`;
        if (whitelist.main.length > 0) {
            str += '**System Admins**\n';
        }
        for (const id of whitelist.main) {
            str += `<@${id}>\n`;
        }
        if (whitelist.cmod.length > 0) {
            str += '\n**Semi Global Access**\n';
        }
        for (const id of whitelist.cmod) {
            str += `<@${id}>\n`;
        }
        if (whitelist.rollback.length > 0) {
            str += '\n**Rollback Access**\n';
        }
        for (const id of whitelist.rollback) {
            str += `<@${id}>\n`;
        }
        if (whitelist.localConfig[String(interaction.guildId)]?.whitelist.main.length > 0) {
            str += '\n**Full Local Access**\n';
        }
        for (const id of whitelist.localConfig[String(interaction.guildId)]?.whitelist.main || []) {
            str += `<@${id}>\n`;
        }
        if (whitelist.localConfig[String(interaction.guildId)]?.whitelist.cmod.length > 0) {
            str += '\n**Semi Local Access**\n';
        }
        for (const id of whitelist.localConfig[String(interaction.guildId)]?.whitelist.cmod || []) {
            str += `<@${id}>\n`;
        }
        if (whitelist.localConfig[String(interaction.guildId)]?.whitelist.rollback.length > 0) {
            str += '\n**Local Rollback Access**\n';
        }
        for (const id of whitelist.localConfig[String(interaction.guildId)]?.whitelist.rollback || []) {
            str += `<@${id}>\n`;
        }
        await interaction.reply({ embeds: [new EmbedBuilder().setTitle('Whitelist').setDescription(str)]});
    }
};