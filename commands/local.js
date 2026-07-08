const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('localsetup')
        .setDescription('creates a local config for the server')
        .addStringOption(option => option.setName('wiki').setDescription('The wiki to create a local config for').setRequired(true))
        .addStringOption(option => option.setName('lang').setDescription('The language code.').setRequired(true))
        .addStringOption(option => option.setName('serverid').setDescription('The ID of the server to edit the whitelist for. (blank for global)').setRequired(false)),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(String(interaction.user.id))) {
            await interaction.reply({ content: 'You are not permitted to create local configs.' });
            return;
        }
        const wiki = interaction.options.getString('wiki');
        const serverId = interaction.options.getString('serverid').replace('/global/g', 'global');
        const lang = interaction.options.getString('lang') || 'en';
        let config = JSON.parse(fs.readFileSync('./sensitive/whitelist.json'));
        if (config.localConfig[String(serverId)] === undefined) {
            config.localConfig[String(serverId)] = {
                wiki: wiki,
                lang: lang,
                whitelist: {
                    main: [],
                    cmod: [],
                    rollback: []
                },
                blacklist: []
            };
        } else {
            await interaction.reply({ content: `Server ID ${serverId} does already exist as a local config.` });
            return;
        }

        fs.writeFileSync('./sensitive/whitelist.json', JSON.stringify(config, null, 2));
        await interaction.reply({ content: `Local config for wiki ${wiki} with language code ${lang} created successfully ${serverId !== 'global' ? `for server ${serverId}` : 'globally'}.` });
    }
};