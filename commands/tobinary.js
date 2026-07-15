const { SlashCommandBuilder } = require('discord.js');
const { toBinary } = require('../modules-custom/math');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tobinary')
        .setDescription('convert an integer to binary.')
        .addNumberOption(option => option.setName('number').setDescription('Number to convert').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const n = interaction.options.getNumber('number');
        let bin;
        try {
            bin = toBinary(n);
        } catch(e) {
            await interaction.editReply({ content: `An error occured: ${e.message}` });
            return;
        }
        await interaction.editReply({ content: `Binary representation of ${n} is \`${bin}\`.` });
    }
};