const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Provides list of available commands + what they do.'),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        let str = `# Serotonin Bot Help\n**FANDOM Username**: **[CrazyBotAcc](https://community.fandom.com/wiki/User:CrazyBotAcc)**\n**Available Commands:**\n`;
        if (interaction.user.id === interaction.guild.ownerId && !whitelist.localConfig[interaction.guildId]) {
            str += `No local config found for this server, please contact one of the system admins on discord: ${whitelist.main.map(id => `\n<@${id}>`).join(', ')}\n\n`;
        }
        const commandFiles = fs.readdirSync('commands').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./${file}`);
            if ('data' in command) {
                str += `- **/${command.data.name}**: ${command.data.description}\n`;
            }
        }
        const embed = new EmbedBuilder()
            .setTitle(' ')
            .setDescription(`${str}\n**${commandFiles.length} total unique commands.**`);
        await interaction.reply({ embeds: [embed] });
    }
}