const { SlashCommandBuilder, PresenceUpdateStatus, ActivityType } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('change status of the bot')
        .addStringOption(option => option.setName('type').setDescription('status').setRequired(true).addChoices(
            { name: 'online', value: 'online' },
            { name: 'dnd', value: 'dnd' },
            { name: 'idle', value: 'idle' },
            { name: 'invisible', value: 'offline' },
        ))
        .addStringOption(option => option.setName('activitytype').setDescription('change activity of the bot').setRequired(false).addChoices(
            { name: 'Playing', value: `${ActivityType.Playing}` },
            { name: 'Streaming', value: `${ActivityType.Streaming}` },
            { name: 'Listening', value: `${ActivityType.Listening}` },
            { name: 'Watching', value: `${ActivityType.Watching}` },
            { name: 'Competing', value: `${ActivityType.Competing}` },
        ))
        .addStringOption(option => option.setName('activityname').setDescription('change activity of the bot').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({  });
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) {
            await interaction.editReply({ content: 'You are not on the whitelist.' });
            return;
        }
        const status = interaction.options.getString('type');
        const activityType = interaction.options.getString('activitytype');
        const activityName = interaction.options.getString('activityname');

        const statuses = {
            online: PresenceUpdateStatus.Online,
            dnd: PresenceUpdateStatus.DoNotDisturb,
            idle: PresenceUpdateStatus.Idle,
            offline: PresenceUpdateStatus.Invisible
        };

        await interaction.client.user.setPresence({
            activities: [{ name: activityName || 'Fandom.com', type: activityType !== null && activityType !== undefined ? Number(activityType) : ActivityType.Watching }],
            status: statuses[status]
        });
        /*
        await interaction.client.user.setPresence({
            //activities: [{ name: `Fandom.com`, type: ActivityType.Watching }],
            status: status
        });
        */
        fs.writeFileSync('./sensitive/status.json', JSON.stringify({ status: status, activityType: activityType !== null && activityType !== undefined ? Number(activityType) : undefined, activityName: activityName ? activityName : undefined }, null, 2));
        await interaction.editReply({ content: 'Status updated.'});
    }
};