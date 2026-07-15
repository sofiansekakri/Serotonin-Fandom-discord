const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { child_process } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Shut down the bot')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of shutdown')
                .setRequired(true).addChoices(
                    { name: 'bot', value: 'bot' },
                    { name: 'server', value: 'server' },
                    { name: 'minecraft', value: 'mc' }
                )),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        const type = interaction.options.getString('type');
        if (interaction.user.id !== whitelist.owner) { await interaction.reply({content:'nope', flags: 64}); return;}
        if (type === 'bot') {
            await interaction.reply({ content: 'Gn, father.' });
            process.exit(0);
        } else if (type === 'server') {
            await interaction.reply({ content: 'Goodnight.' });
            child_process.exec('sudo shutdown -s -t 0', (error, stdout, stderr) => {
                if (error) {
                    interaction.editReply({ content: `Error executing shutdown: ${error}` });
                    return;
                }
            });
        } else if (type === 'mc') {
            return child_process.exec('systemctl shutdown mc', (error, stdout, stderr) => {
                if (error) {
                    interaction.editReply({ content: `Error executing shutdown: ${error}` });
                    return;
                }
            });
        }
    }
};