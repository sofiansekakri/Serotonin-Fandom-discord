const { SlashCommandBuilder } = require('discord.js');
const { toInt } = require('../modules-custom/math');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tointeger')
        .setDescription('convert binary to an integer.')
        .addStringOption(option => option.setName('binary').setDescription('Number to convert').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const n = interaction.options.getString('binary');
        if (!/^[01]+$/.test(n)) {
            await interaction.editReply({ content: `Your input includes forbidden characters.` });
            return;
        }
        let bin;
        try {
            bin = toInt(n);
        } catch(e) {
            await interaction.editReply({ content: `An error occured: ${e.message}` });
            return;
        }
        await interaction.editReply({ content: `Integer representation of \`${n}\` is **${bin}**.` });
    }
};