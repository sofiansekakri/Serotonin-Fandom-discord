const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('editwhitelist')
        .setDescription('edits the whitelist')
        .addUserOption(option => option.setName('user').setDescription('The user to add/remove from the whitelist').setRequired(true))
        .addStringOption(option => option.setName('accesslevel').setDescription('The access level to set for the user').setRequired(true).addChoices(
            { name: 'full', value: '1' },
            { name: 'semi', value: '0' },
            { name: 'rollback', value: '-1' }
        ))
        .addStringOption(option => option.setName('serverid').setDescription('The ID of the server to edit the whitelist for. (blank for global)').setRequired(false))
        .addBooleanOption(option => option.setName('remove').setDescription('remove the user from the whitelist').setRequired(false)),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        const serverId = interaction.options.getString('serverid') || 'global';
        const accessLevel = interaction.options.getString('accesslevel');
        if (
            !whitelist.main.includes(interaction.user.id) &&
            !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.main?.includes(interaction.user.id) &&
            accessLevel !== '-1'
        ) {
            await interaction.reply({ content: 'You are not permitted to edit the whitelist.' });
            return;
        }

        if (
            accessLevel === '-1' &&
            !whitelist.main.includes(interaction.user.id) &&
            !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.main?.includes(interaction.user.id)
        ) {
            await interaction.reply({ content: 'Only main whitelist users can assign rollback.' });
            return;
        }
        const user = interaction.options.getUser('user');
        if (serverId === 'global' && interaction.options.getString('accesslevel') === '1' && whitelist.owner !== interaction.user.id) {
            await interaction.reply({ content: 'You cannot edit the global admin whitelist.' });
            return;
        }
        const remove = interaction.options.getBoolean('remove') || false;
        if (whitelist.localConfig[String(serverId)] === undefined && serverId !== 'global') {
            await interaction.reply({ content: `Server ID ${serverId} does not exist in the whitelist.` });
            return;
        }
        if (accessLevel === '1') {
            if (remove) {
                if (serverId === 'global') {
                    whitelist.main = whitelist.main.filter(id => id !== user.id);
                } else if (serverId !== 'global') {
                    try {
                        whitelist.localConfig[String(serverId)].whitelist.main = whitelist.localConfig[String(serverId)].whitelist.main.filter(id => id !== String(user.id));
                    }
                    catch (err) {
                        await interaction.reply({ content: `Server ID ${serverId} does not exist in the whitelist.` });
                        return;
                    }
                }
                fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(whitelist, null, 2));
                await interaction.reply({ content: `Removed ${user.tag} with full access ${serverId !== 'global' ? `for server ${serverId}` : 'globally'}.` });
                return;
            }
            if (serverId === 'global') {
                if (whitelist.main.includes(user.id)) {
                    await interaction.reply({ content: `${user.tag} is already in the whitelist.` });
                    return;
                }
                whitelist.main.push(user.id);
            } else if (serverId !== 'global' && !whitelist.localConfig[String(serverId)].whitelist.main.includes(user.id)) {
                whitelist.localConfig[String(serverId)].whitelist.main.push(user.id);
            }
        } else if (accessLevel === '0') {
            if (remove) {
                if (serverId === 'global') {
                    whitelist.cmod = whitelist.cmod.filter(id => id !== user.id);
                } else if (serverId !== 'global') {
                    try {
                        whitelist.localConfig[String(serverId)].whitelist.cmod = whitelist.localConfig[String(serverId)].whitelist.cmod.filter(id => id !== String(user.id));
                    }
                    catch (err) {
                        await interaction.reply({ content: `Server ID ${serverId} does not exist in the whitelist.` });
                        return;
                    }
                }
                fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(whitelist, null, 2));
                await interaction.reply({ content: `Removed ${user.tag} with semi-access ${serverId !== 'global' ? `for server ${serverId}` : 'globally'}.` });
                return;
            }
            if (serverId === 'global') {
                if (whitelist.cmod.includes(user.id)) {
                    await interaction.reply({ content: `${user.tag} is already in the whitelist.` });
                    return;
                }
                whitelist.cmod.push(user.id);
            } else if (serverId !== 'global' && !whitelist.localConfig[String(serverId)].whitelist.cmod.includes(user.id)) {
                whitelist.localConfig[String(serverId)].whitelist.cmod.push(user.id);
            }
        } else if (accessLevel === '-1') {
            if (remove) {
                if (serverId === 'global') {
                    whitelist.rollback = whitelist.rollback.filter(id => id !== user.id);
                } else if (serverId !== 'global') {
                    try {
                        whitelist.localConfig[String(serverId)].whitelist.rollback = whitelist.localConfig[String(serverId)].whitelist.rollback.filter(id => id !== String(user.id));
                    }
                    catch (err) {
                        await interaction.reply({ content: `Server ID ${serverId} does not exist in the whitelist.` });
                        return;
                    }
                }
                fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(whitelist, null, 2));
                await interaction.reply({ content: `Removed ${user.tag} with rollback access ${serverId !== 'global' ? `for server ${serverId}` : 'globally'}.` });
                return;
            }
            if (serverId === 'global') {
                if (whitelist.rollback.includes(user.id)) {
                    await interaction.reply({ content: `${user.tag} is already in the whitelist.` });
                    return;
                }
                whitelist.rollback.push(user.id);
            } else if (serverId !== 'global' && !whitelist.localConfig[String(serverId)].whitelist.rollback.includes(user.id)) {
                whitelist.localConfig[String(serverId)].whitelist.rollback.push(user.id);
            }
        }

        fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(whitelist, null, 2));
        await interaction.reply({ content: `Added ${user.tag} with ${accessLevel === '1' ? 'full' : accessLevel === '0' ? 'semi' : 'rollback'} access ${serverId !== 'global' ? `for server ${serverId}` : 'globally'}.` });
    }
};