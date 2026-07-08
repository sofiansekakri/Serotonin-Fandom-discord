const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { convert, convertBack} = require('../modules-custom/binary.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('binary')
        .setDescription('convert text to binary and back')
        .addStringOption(option => option.setName('type').setDescription('convert to binary or back').setRequired(true).addChoices({ name: 'to binary', value: 'toBinary' }, { name: 'to text', value: 'toText' }))
        .addStringOption(option => option.setName('content').setDescription('the text to convert').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const text = interaction.options.getString('content');
        const type = interaction.options.getString('type');
        if (type === 'toBinary') {
            const binary = convert(text);
            await interaction.editReply({content:binary});
        } else {
            const convertedText = convertBack(text);
            await interaction.editReply({content:convertedText});
        }
    }
};