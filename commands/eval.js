const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate JavaScript code')
        .addStringOption(option => option.setName('code').setDescription('The code to evaluate').setRequired(true)),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) { await interaction.reply({content:'you are not permitted to use this command.', flags: 64}); return;}
        const code = interaction.options.getString('code');
        if (code.includes('client.token') || code.includes('login.token') || code.includes('fs.readFileSync') || code.includes('fs.writeFileSync')) {
            await interaction.reply({ content: 'Access to sensitive data is not allowed.', flags: 64 });
            return;
        }
        let result;
        try {
            result = eval(code);
        } catch (error) {
            result = error.message;
        }
        await interaction.reply({ content: `Result: ${result}`, flags: 64 });
    }
};