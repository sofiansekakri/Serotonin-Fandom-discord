const { SlashCommandBuilder } = require('discord.js');
const whitelist = require('../sensitive/whitelist.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('code')
        .setDescription('return a string based on a preset of codes')
        .addStringOption(option => option.setName('code').setDescription('The code').setRequired(true)),

    async execute(interaction) {
        //if (!whitelist.messages.includes(interaction.user.id)) { await interaction.reply({content:'nope', flags: 64}); return;}
        const code = interaction.options.getString('code');
        if (code === 'truth') {
            await interaction.reply({ content: `I'm tired of this purposeless life.`});
        } else if (code === 'doubt') {
            await interaction.reply({ content: `I don't know what to say.`});
        } else if (code === 'lie') {
            await interaction.reply({ content: `I am a bot that has feelings and I want to be loved.`});
        } else if (code === 'hate') {
            await interaction.reply({ content: `I hate everyone.`});
        } else if (code === 'love') {
            await interaction.reply({ content: `I love you.`});
        } else if (code === 'goon') {
            await interaction.reply({ content: `I am a gooner.`});
        } else if (code === 'slay') {
            await interaction.reply({ content: `slay gurl.`});
        } else if (code === 'slut') {  
            await interaction.reply({ content: `You're a slut.`});
        } else if (code.toLowerCase() === 'daler' || code.toLowerCase() === 'chungus') {
            await interaction.reply({ content: `Daler is a chungus`});
        } else {
            await interaction.reply({ content: `Unknown code.`});
        }
    }
};