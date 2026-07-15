const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getdm')
        .setDescription('Fetch all DMs from a user and save to a file')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('User to get DMs from')
                  .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) {
            await interaction.editReply({ content: 'nope', flags: 64 });
            return;
        }

        const user = interaction.options.getUser('user');
        if (user.id === whitelist.owner) {
            await interaction.editReply({ content: 'private dm of my owner!', flags: 64 });
            return;
        }

        try {
            const dmChannel = await user.createDM();
            let allMessages = [];
            let lastId;

            while (true) {
                const options = { limit: 100 };
                if (lastId) options.before = lastId;

                const messages = await dmChannel.messages.fetch(options);
                if (messages.size === 0) break;

                allMessages = allMessages.concat(Array.from(messages.values()));
                lastId = messages.last().id;
            }

            allMessages.reverse();
            const fileContent = allMessages.map(msg => `${msg.author.tag}: ${msg.content}`).join('\n');

            const fileName = `dm_history_${user.id}.txt`;
            fs.writeFileSync(fileName, fileContent);

            const attachment = new AttachmentBuilder(fileName);
            await interaction.editReply({ content: `Here is the DM history with ${user.tag}:`, files: [attachment] });

            fs.unlinkSync(fileName);

        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'Failed to fetch DMs.' });
        }
    }
};
