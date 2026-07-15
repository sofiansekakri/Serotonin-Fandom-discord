const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('addquote')
        .setDescription('Add a new quote')
        .addStringOption(option => option.setName('quote').setDescription('The quote to add').setRequired(true))
        .addStringOption(option => option.setName('author').setDescription('The author of the quote').setRequired(true)),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) {
            await interaction.reply({ content: 'You are not on the whitelist.', flags: 64 });
            return;
        }
        const quote = interaction.options.getString('quote');
        const author = interaction.options.getString('author');
        const quotes = JSON.parse(fs.readFileSync('./assets/quotes.json', 'utf8')).quotes;
        quotes.push(`“${quote}” -${author}`);
        fs.writeFileSync('./assets/quotes.json', JSON.stringify({ quotes: quotes }, null, 2));
        await interaction.reply({ content: 'Quote added successfully!' });

    }
};