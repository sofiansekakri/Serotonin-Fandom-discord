const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { randomItem } = require('../modules-custom/math');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Send a random quote'),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json'));
        if (whitelist.guilds['quotes_blacklist'].includes(interaction.guildId)) { await interaction.reply('this command is disabled here.'); return; }
        const quotes = JSON.parse(fs.readFileSync('./assets/quotes.json', 'utf8')).quotes;
        await interaction.reply({ content: randomItem(quotes) });

    }
};