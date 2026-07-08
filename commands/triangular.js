const { SlashCommandBuilder } = require('discord.js');
const { triangular } = require('../modules-custom/math');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('triangular')
        .setDescription('perform a triangular calculation')
        .addNumberOption(option => option.setName('number').setDescription('Number to triangulate.').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const n = interaction.options.getNumber('number');
        let tri;
        try {
            tri = triangular(n);
        } catch(e) {
            await interaction.editReply({ content: `An error occured: ${e.message}` });
            return;
        }
        await interaction.editReply({ content: `Triangulation of ${n} is ${tri}.` });
    }
};