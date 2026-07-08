const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const login = require('../sensitive/mwlogin.json');
const fs = require('fs');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('undelete') 
    .setDescription('restore a page')
    .addStringOption(option => option.setName('title').setDescription('The title of the page to restore').setRequired(true))
    .addStringOption(option => option.setName('wiki').setDescription('The wiki to restore the page on').setRequired(false))
    .addStringOption(option => option.setName('lang').setDescription('wiki language code').setRequired(false))
    .addStringOption(option => option.setName('reason').setDescription('The reason for restoring the page').setRequired(false)),
    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)&& !whitelist.cmod.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.main.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.cmod.includes(interaction.user.id)) { await interaction.reply({content:'you\'re not permitted to use this command.', flags: 64}); return;}
        const title = interaction.options.getString('title');
        let wiki = interaction.options.getString('wiki') ? `https://${interaction.options.getString('wiki')}.fandom.com` : login.wiki;
        let lang = interaction.options.getString('lang') ? interaction.options.getString('lang').toLowerCase() : 'en';
        const reason = interaction.options.getString('reason');
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
        await interaction.deferReply();
        const client = wrapper(axios.create({
            jar: new tough.CookieJar(),
            withCredentials: true
        }));
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
        const undeletePageRes = await client({
            method: 'post',
            url: `${wiki}/api.php`,
            responseType: 'text',
            data: new URLSearchParams({
                title: `${title}`,
                action: 'undelete',
                format: 'json',
                token: `${csrfTokenFirst}`,
                reason: `[DISCORD] Restored by ${interaction.user.tag}, ${interaction.user.id}: ${reason ? reason : 'No reason provided'}`,
                bot: true
            })
        });
        const undeleteResult = JSON.parse(undeletePageRes.data);
        if (undeleteResult.error) {
            interaction.editReply({ content: `Failed to restore page. Error: ${undeleteResult.error.info}` });
            return;
        }
        interaction.editReply({ content: `Successfully restored page ${title}.` });
    }
};
