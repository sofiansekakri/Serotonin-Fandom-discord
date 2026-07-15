const { SlashCommandBuilder } = require('discord.js');
const { Logarithm } = require('../modules-custom/math');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log2')
        .setDescription('calculate an exponent with the binary logarithm')
        .addNumberOption(option => option.setName('number').setDescription('number to evaluate the exponent to the base 10.').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const n = interaction.options.getNumber('number');
        const log = new Logarithm(2);
        let exp;
        try {
            exp = log.getExponent(n);
        } catch(e) {
            await interaction.editReply({ content: `An error occured: ${e.message}` });
            return;
        }
        await interaction.editReply({ content: `2 ^ ${exp} = ${n}` });
    }
};