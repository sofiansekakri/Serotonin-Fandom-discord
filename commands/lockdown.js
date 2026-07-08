const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('restrict usage to sysadmins')
        .addStringOption(option => option.setName('action').setChoices({name: 'initiate', value: 'true'}, {name: 'resolve', value: 'false'}).setRequired(true).setDescription('action to perform'))
    ,

    async execute(interaction) {
        await interaction.deferReply();
        let whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        const action = interaction.options.getString('action') === 'true' ? true : false;
        if (!whitelist.main.includes(String(interaction.user.id))) {
            await interaction.editReply({ content: 'you cannot perform a lockdown.' });
            return;
        }
        let lockdown = JSON.parse(fs.readFileSync('./sensitive/lockdown.json')); 
        if (action === lockdown['dbLock']) {
            await interaction.editReply('Bot is already in said state.');
            return;
        }
        lockdown['dbLock'] = action;
        fs.writeFileSync('./sensitive/lockdown.json', JSON.stringify(lockdown, null, 2));
        await interaction.editReply({ content: `Limited access successfully ${action === true ? 'initiated' : 'resolved'}.` });
    }
};
