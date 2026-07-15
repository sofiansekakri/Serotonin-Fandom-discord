const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { randomItem } = require('../modules-custom/math');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('send a random meme from the db'),

    async execute(interaction) {
        await interaction.deferReply();
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (whitelist.guilds.memes_blacklist.includes(interaction.guildId)) {
            await interaction.editReply({ content: 'memes are disabled in this server.' });
            return;
        }
        const commandFiles = fs.readdirSync('./assets/memes/').filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.gif') || file.endsWith('.webp') || file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.mov'));
        if (commandFiles.length === 0) {
            await interaction.editReply({ content: 'No memes available.' });
            return;
        }
        const randomFile = randomItem(commandFiles);
        await interaction.editReply({ files: [`./assets/memes/${randomFile}`] });
    }
};
