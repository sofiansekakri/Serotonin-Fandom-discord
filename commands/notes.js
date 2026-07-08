const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notes')
        .setDescription('store and view notes for an user')
        .addUserOption(option => option.setName('user').setDescription('the user to manage/view notes for').setRequired(true))
        .addStringOption(option => option.setName('type').setDescription('create or view notes').setRequired(true).addChoices({ name: 'edit', value: 'edit' }, { name: 'view', value: 'view' }))
        .addStringOption(option => option.setName('content').setDescription('the note content').setRequired(false))
        .addBooleanOption(option => option.setName('hidden').setDescription('response only visible to you.').setRequired(false)),
    async execute(interaction) {
        if (interaction.options.getBoolean('hidden')) {
            await interaction.deferReply({ flags: 64 });
        } else {
            await interaction.deferReply();
        }
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf-8'));
        if (!whitelist.main.includes(interaction.user.id) && !whitelist.cmod.includes(interaction.user.id)) {
            await interaction.editReply({ content: 'You are not authorized to use this command.' });
            return;
        }
        const text = interaction.options.getString('content') ?? '';
        const type = interaction.options.getString('type');
        const targetUser = interaction.options.getUser('user');
        if (type === 'edit') {
            const content = await fs.promises.readFile(`./notes/main.json`, 'utf-8');
            let obj = content ? JSON.parse(content) : { [targetUser.id]: { notes: [] } };
            if (!obj[targetUser.id]) {
                obj[targetUser.id] = { notes: [] };
            }
            obj[targetUser.id].notes.push({
                content: text.replace(/(<@!?\d+>|\*\*endnote\*\*)/gi, '') + '\n**ENDNOTE**',
                createdBy: interaction.user.id,
                date: new Date().toUTCString()
            });
            await fs.promises.writeFile(`./notes/main.json`, JSON.stringify(obj, null, 2));
            const newObj = interaction.options.getBoolean('hidden') ?? false ? { content: 'Note added successfully.', flags: 64 } : { content: 'Note added successfully.' };
            await interaction.editReply(newObj);
        } else if (type === 'view') {
            const content = await fs.promises.readFile(`./notes/main.json`, 'utf-8');
            let obj = content ? JSON.parse(content) : { [targetUser.id]: { notes: [] } };
            let str = '';
            (obj[targetUser.id]?.notes ?? []).forEach(note => {
                str += `\n**${note.date}**\n<@${note.createdBy}>\n${note.content}\n`;
            });
            const embed = new EmbedBuilder()
                .setTitle(`Notes for ${targetUser.tag}`)
                .setDescription(str ? str : 'no notes found.');
            const newObj = interaction.options.getBoolean('hidden') ?? false ? { embeds: [embed], flags: 64} : { embeds: [embed] };
            await interaction.editReply(newObj);
        
        }
    }
};