const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const child_process = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cmd')
        .setDescription('Execute a command')
        .addStringOption(option => option.setName('command').setDescription('The command to execute').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) { await interaction.reply({content:'you are not authorized to use this command.'}); return;}
        const command = interaction.options.getString('command');
        child_process.exec(command, (error, stdout, stderr) => {
            if (error) {
                interaction.editReply({ content: `Error: ${error.message}`, flags: 64 });
                return;
            } else if (stderr) {
                interaction.editReply({ content: `Stderr: ${stderr}`, flags: 64 });
                return;
            } else if (stdout) {
                interaction.editReply({ content: `Output: ${stdout}`, flags: 64 });
                return;
            }
        });  
    }
};