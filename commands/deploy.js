const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const child_process = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('deploy commands to the REST API'),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) {
            return interaction.reply({
                content: 'You are not permitted to use this command.',
                flags: 64
            });
        }

        await interaction.deferReply();

        child_process.exec('node /var/_DEV-BOT/serotonin/deploy.js', (error, stdout, stderr) => {
            if (error) {
                return interaction.editReply({
                    content: `Deploy failed:\n\`\`\`${error.message}\`\`\``
                });
            }
            interaction.editReply({
                content: 'Deploy completed successfully.'
            });
            return;
        });
    }
};
