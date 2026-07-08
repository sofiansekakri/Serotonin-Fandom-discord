const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('show command logs')
        .addBooleanOption(option => option.setName('file').setDescription('get log as file').setRequired(false))
        .addNumberOption(option => option.setName('lines').setDescription('number of recent lines to show').setRequired(false).setMinValue(1).setMaxValue(10)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const getFile = interaction.options.getBoolean('file') ?? false;
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) { await interaction.editReply({content:'you are not authorized to use this command.'}); return;}
        if (getFile && interaction.options.getNumber('lines')) {
            return interaction.editReply({
                content: 'Do not combine file and lines options.'
            });
        }
        if (getFile) {
            await interaction.editReply({ content: 'CMD LOGS, **DONT** SHARE', files: ['./logs/cmds.log'], flags: 64 });
            return;
        }
        const lines = interaction.options.getNumber('lines') || 10;
        const log = fs.readFileSync('./logs/cmds.log', 'utf8');
        const recentLogs = log.split(/\r?\n/).slice(-lines).join('\n');
        await interaction.editReply({ content: `CMD LOGS, **DONT** SHARE \n\`\`\`\n${recentLogs.slice(0, 1960)}\n\`\`\``, flags: 64 });
        //interaction.editReply({ content: `Command Logs: \n${log}`, flags: 64 });
    }
};