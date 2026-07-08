const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const login = require('../sensitive/mwlogin.json');
const fs = require('fs');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('protect') 
    .setDescription('protect a page')
    .addStringOption(option => option.setName('title').setDescription('The title of the page to protect').setRequired(true))
    .addStringOption(option => option.setName('wiki').setDescription('The wiki to protect the page on').setRequired(false))
    .addStringOption(option => option.setName('lang').setDescription('wiki language code').setRequired(false))
    .addStringOption(option => option.setName('reason').setDescription('The reason for protecting the page').setRequired(false))
    .addBooleanOption(option => option.setName('semiprotect').setDescription('semi-protect the page').setRequired(false))
    .addStringOption(option => option.setName('duration').setDescription('The duration of the protection (e.g. 1 day, 3 weeks, indefinite)').setRequired(false)),
    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id) && !whitelist.cmod.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.main.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.cmod.includes(interaction.user.id)) { await interaction.reply({content:'you\'re not permitted to use this command.', flags: 64}); return;}
        const title = interaction.options.getString('title');
        let wiki = interaction.options.getString('wiki') ? `https://${interaction.options.getString('wiki')}.fandom.com` : login.wiki;
        let lang = interaction.options.getString('lang') ? interaction.options.getString('lang').toLowerCase() : 'en';
        const reason = interaction.options.getString('reason');
        const semiprotect = interaction.options.getBoolean('semiprotect') ? 'autoconfirmed' : 'sysop';
        const duration = interaction.options.getString('duration') ? interaction.options.getString('duration') : 'indefinite';

        await interaction.deferReply();
        const client = wrapper(axios.create({
            jar: new tough.CookieJar(),
            withCredentials: true
        }));
        if (whitelist.localConfig[String(interaction.guildId)]) {
            if (!whitelist.main.includes(interaction.user.id) && !whitelist.cmod.includes(interaction.user.id)) {
                wiki = `https://${whitelist.localConfig[String(interaction.guildId)].wiki}.fandom.com`;
            } else {
                wiki = interaction.options.getString('wiki') ? `https://${interaction.options.getString('wiki')}.fandom.com` : `https://${whitelist.localConfig[String(interaction.guildId)].wiki}.fandom.com` ;
            }
            lang = lang || whitelist.localConfig[String(interaction.guildId)].lang || 'en';
        }
        if (lang !== 'en' && lang) {
            wiki = `${wiki}/${lang}`;
        } 
        const loginTokenRes = await client({
            method: 'get',
            url: `${wiki}/api.php`,
            responseType: 'text',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                action: 'query',
                format: 'json',
                meta: 'tokens',
                type: 'login'
            }   
        });
        const loginToken = JSON.parse(loginTokenRes.data).query.tokens.logintoken;
        //console.log('Login token: True');
        const loginRes = await client({
            method: 'post',
            url: `${wiki}/api.php`,
            responseType: 'json',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: new URLSearchParams({
                action: 'login',
                format: 'json',
                lgname: login.username,
                lgpassword: login.password,
                lgtoken: loginToken
            })
        });
        const loginResult = loginRes.data.login.result;
        //console.log(loginResult);
        if (loginResult !== 'Success') {
            interaction.editReply({ content: 'Failed to login.' });
            return;
        }
        //console.log('Logged in: True', '\nAttempting to get csrf token.');
        const csrfTokenResFirst = await client({
            method: 'get',
            url: `${wiki}/api.php`,
            responseType: 'json',
            params: {
                action: 'query',
                format: 'json',
                meta: 'tokens'
            }   
        });
        //console.log(csrfTokenRes.data);
        const csrfTokenFirst = csrfTokenResFirst.data.query.tokens.csrftoken;
        const protectPageRes = await client({
            method: 'post',
            url: `${wiki}/api.php`,
            responseType: 'text',
            data: new URLSearchParams({
                title: `${title}`,
                action: 'protect',
                protections: `edit=${semiprotect}|move=${semiprotect}`,
                expiry: `${duration}`,
                format: 'json',
                token: `${csrfTokenFirst}`,
                reason: `[DISCORD] Protected by ${interaction.user.tag}, ${interaction.user.id}: ${reason ? reason : 'No reason provided'}`,
                bot: true
            })
        });
        const protectResult = JSON.parse(protectPageRes.data);
        if (protectResult.error) {
            interaction.editReply({ content: `Failed to protect page. Error: ${protectResult.error.info}` });
            return;
        }
        interaction.editReply({ content: `Successfully protected page ${title}.` });
    }
};