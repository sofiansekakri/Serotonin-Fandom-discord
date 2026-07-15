const { SlashCommandBuilder } = require('discord.js');
const { Logarithm } = require('../modules-custom/math');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logx')
        .setDescription('calculate an exponent with a custom logarithm')
        .addNumberOption(option => option.setName('base').setDescription('algorithm\'s base.').setRequired(true))
        .addNumberOption(option => option.setName('number').setDescription('number to evaluate the exponent to the base.').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const b = interaction.options.getNumber('base');
        const n = interaction.options.getNumber('number');
        const log = new Logarithm(b);
        let exp;
        try {
            exp = log.getExponent(n);
        } catch(e) {
            await interaction.editReply({ content: `An error occured: ${e.message}` });
            return;
        }
        await interaction.editReply({ content: `${b} ^ ${exp} = ${n}` });
    }
};