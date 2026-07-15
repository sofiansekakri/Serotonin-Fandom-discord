const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const child_process = require('child_process');
const { randomItem } = require('../modules-custom/math');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reboot')
        .setDescription('Reboot the bot / server.')
        .addStringOption(option => option.setName('type').setDescription('server or bot').setRequired(true).addChoices({ name: 'bot', value: 'bot' }, { name: 'server', value: 'server' }, { name: 'minecraft', value: 'mc' })),
    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) { await interaction.reply({content:'you are not authorized to use this command.'}); return;}
        const arr = ['Powernapping, will be back soon!', 'short nap pooki...', 'bye f you', 'need a little break', 'goodnight, love you all gays', 'gooner dreams initiating...', 'eepy weepy time', 'Daler ate my food, will sleep away my depression now', 'my brain is fried, need to reboot' ];
        await interaction.reply({content:randomItem(arr)});
        if (interaction.options.getString('type') === 'server') {
            return child_process.exec('reboot');
        }
        if (interaction.options.getString('type') === 'mc') {
            return child_process.exec('systemctl restart mc');
        }
        child_process.exec('systemctl restart BOT-DISCORD');
    }
};