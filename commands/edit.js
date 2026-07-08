const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const login = require('../sensitive/mwlogin.json');
const fs = require('fs');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit') 
        .setDescription('edit a page')
        .addStringOption(option => option.setName('title').setDescription('The title of the page to edit').setRequired(true))
        .addStringOption(option => option.setName('content').setDescription('The content to edit the page with').setRequired(true))
        .addStringOption(option => option.setName('wiki').setDescription('The wiki to edit the page on').setRequired(false))
        .addStringOption(option => option.setName('lang').setDescription('wiki language code').setRequired(false))
        .addStringOption(option => option.setName('reason').setDescription('The reason for editing the page').setRequired(false))
        .addBooleanOption(option => option.setName('append').setDescription('append to the page').setRequired(false))
        .addBooleanOption(option => option.setName('prepend').setDescription('prepend to the page').setRequired(false))
        .addBooleanOption(option => option.setName('create').setDescription('create the page').setRequired(false)),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id) && !whitelist.cmod.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.main.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.cmod.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.rollback.includes(interaction.user.id) && !whitelist.rollback.includes(interaction.user.id)) { await interaction.reply({content:'you\'re not permitted to use this command!', flags: 64}); return;}
        const title = interaction.options.getString('title');
        const content = interaction.options.getString('content');
        let wiki = interaction.options.getString('wiki') ? `https://${interaction.options.getString('wiki')}.fandom.com` : login.wiki;
        let lang = interaction.options.getString('lang') ? interaction.options.getString('lang').toLowerCase() : 'en';
        const reason = interaction.options.getString('reason');
        const append = interaction.options.getBoolean('append') ? true : false;
        const prepend = interaction.options.getBoolean('prepend');
        const create = interaction.options.getBoolean('create') ? true : false;

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
        const createUserPageRes = await client({
            method: 'post',
            url: `${wiki}/api.php`,
            responseType: 'text',
            data: new URLSearchParams({
                title: `User:CrazyBotAcc`,
                action: 'edit',
                format: 'json',
                text: `{{w::User:CrazyBotAcc}}`,
                token: `${csrfTokenFirst}`,
                summary: `[DISCORD] Auto creating user page.`,
                bot: true,
                createonly: 'true'
            })
        });
        if (JSON.parse(createUserPageRes.data)) {
            //console.log('User page created successfully or already exists.');
        }

        const csrfTokenRes = await client({
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
        const csrfToken = csrfTokenRes.data.query.tokens.csrftoken;
        // const watchToken = csrfTokenRes.data.query.tokens.watchtoken;
        if (!append) {
            let obj = {
                title: `${title}`,
                action: 'edit',
                format: 'json',
                text: `${content}`,
                token: `${csrfToken}`,
                summary: `[DISCORD] Edited by ${interaction.user.tag}, ${interaction.user.id}: ${reason ? reason : 'No reason provided'}`,
                bot: true,
            }
            if (create) {
                obj.createonly = 'true';
            }
            if (prepend) {
                obj.prependtext = obj.text;
                delete obj.text;
            }
            const editPage = await client({
                    method: 'post',
                    url: `${wiki}/api.php`,
                    responseType: 'text',
                    data: new URLSearchParams(obj)
            });
            const editResponse = JSON.parse(editPage.data);
            if (editResponse && editResponse.edit && editResponse.edit.result === 'Success') {
                interaction.editReply({ content: prepend ? `Content prepended successfully.` : `Page edited successfully.` });
            } else {
                interaction.editReply({ content: 'Failed to edit the page.' });
            }
        } else {
            let obj = {
                title: `${title}`,
                action: 'edit',
                format: 'json',
                appendtext: `${content}`,
                token: `${csrfToken}`,
                summary: `[DISCORD] Edited by ${interaction.user.tag}, ${interaction.user.id}: ${reason ? reason : 'No reason provided'}`,
                bot: true
            };
            if (create) {
                obj.createonly = 'true';
            }
            const appendPage = await client({
                method: 'post',
                url: `${wiki}/api.php`,
                responseType: 'text',
                data: new URLSearchParams(obj),
            });

            const appendResponse = JSON.parse(appendPage.data);
            if (appendResponse && appendResponse.edit && appendResponse.edit.result === 'Success') {
                interaction.editReply({ content: `Content appended successfully.` });
            } else {
                interaction.editReply({ content: 'Failed to append content to the page.' });
            }
        }
    }   
};
