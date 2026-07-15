const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('returns the local config for this server')
        .addNumberOption(option =>
            option.setName('id').setDescription('server ID').setRequired(false)
        ),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        const ID = String(interaction.options.getNumber('id') || interaction.guildId);
        if (!whitelist.localConfig[String(interaction.guildId)]) {
            await interaction.reply({ content: 'No local config set for this server.'});
            return;
        }
        let str = '';
        if (whitelist.localConfig[ID]?.whitelist.main.length > 0) {
            str += '\n**Full Local Access**\n';
        }
        for (const id of whitelist.localConfig[ID]?.whitelist.main || []) {
            str += `<@${id}>\n`;
        }
        if (whitelist.localConfig[ID]?.whitelist.cmod.length > 0) {
            str += '\n**Semi Local Access**\n';
        }
        for (const id of whitelist.localConfig[ID]?.whitelist.cmod || []) {
            str += `<@${id}>\n`;
        }
        if (whitelist.localConfig[ID]?.whitelist.rollback.length > 0) {
            str += '\n**Rollback Access**\n';
        }
        for (const id of whitelist.localConfig[ID]?.whitelist.rollback || []) {
            str += `<@${id}>\n`;
        }
        str += `\n**Wiki**:\n${whitelist.localConfig[ID]?.wiki || 'Not set'}\n \n**Lang**:\n${whitelist.localConfig[ID]?.lang || 'EN'}`;
        await interaction.reply({ embeds: [new EmbedBuilder().setTitle('Config').setDescription(str)]});
    }
};