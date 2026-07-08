const cc = require("classical-cipher");
const fs = require('fs');
const child_process = require('child_process');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cipher')
        .setDescription('Solve a classical cipher.')
        .addStringOption(option => option.setName('type').setDescription('The type of cipher').setRequired(true).addChoices({ name: 'caesar', value: 'caesarShift' }, { name: 'substitution', value: 'simpleSubstitution' }, { name: 'vigenere', value: 'vigenere' }, { name: 'amsco', value: 'amsco' }))
        .addStringOption(option => option.setName('text').setDescription('The cipher text').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) { await interaction.editReply({content:'you are not authorized to use this command.'}); return;}
        try {
            const cipher = cc.solvers.bruteForce.solve({
                cipherText: interaction.options.getString('text'),
                cipher: cc.ciphers[interaction.options.getString('type')],
                stat: cc.stats.chiSquared,
                reporter: cc.reporters.silentReporter
            });
            await interaction.editReply({content: `Best guess:\nKey: ${cipher.key}\nPlaintext: ${cipher.text}`});
        } catch (error) {
            await interaction.editReply({content: `An error occurred while solving the cipher: ${error.message}`});
        }
    }
};
