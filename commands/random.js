const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { randomInt } = require('../modules-custom/math');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('generate a random integer')
        .addNumberOption(option => option.setName('min').setDescription('minimum value').setRequired(true))
        .addNumberOption(option => option.setName('max').setDescription('maximum value').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        //const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        const min = Math.ceil(interaction.options.getNumber('min'));
        const max = Math.floor(interaction.options.getNumber('max'));
        //const arr = ['Powernapping, will be back soon!', 'short nap pooki...', 'bye f you', 'need a little break', 'goodnight, love you all gays', 'goner dreams initiating...', 'eepy weepy time', 'Daler ate my food, will sleep away my depression now', 'my brain is fried, need to reboot' ];
        const rnd = randomInt(min, max);
        await interaction.editReply({content:`The number is: **${rnd}**.`});
    }
};