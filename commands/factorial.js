const { SlashCommandBuilder } = require('discord.js');
const { factorial } = require('../modules-custom/math');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('factorial')
        .setDescription('perform a factorial calculation')
        .addNumberOption(option => option.setName('number').setDescription('Number to factorize.').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const n = interaction.options.getNumber('number');
        let fac;
        try {
            fac = factorial(n);
        } catch(e) {
            await interaction.editReply({ content: `An error occured: ${e.message}` });
            return;
        }
        await interaction.editReply({ content: `factorial of ${n} is ${fac}.` });
    }
};