const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { randomInt } = require('../modules-custom/math');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gayrate')
        .setDescription('how gay is an user?')
        .addUserOption(option => option.setName('user').setDescription('the user to check').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        //const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        const user = interaction.options.getUser('user');
        //const arr = ['Powernapping, will be back soon!', 'short nap pooki...', 'bye f you', 'need a little break', 'goodnight, love you all gays', 'goner dreams initiating...', 'eepy weepy time', 'Daler ate my food, will sleep away my depression now', 'my brain is fried, need to reboot' ];
        const rnd = randomInt(0, 100);
        const txt = `**${user.username}** is ${rnd}% gay.`;
        await interaction.editReply({content:txt});
    }
};