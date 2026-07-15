const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const login = require('../sensitive/mwlogin.json');
const fs = require('fs');
const { JSDOM } = require('jsdom');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rollback') 
        .setDescription('rollback a page')
        .addStringOption(option => option.setName('user').setDescription('The user to rollback the page for').setRequired(true))
        .addStringOption(option => option.setName('title').setDescription('The title of the page to rollback').setRequired(false))
        .addBooleanOption(option => option.setName('mass').setDescription('massrollback (cannot be used with title)').setRequired(false))
        .addStringOption(option => option.setName('wiki').setDescription('The wiki to rollback the page on').setRequired(false))
        .addStringOption(option => option.setName('lang').setDescription('wiki language code').setRequired(false))
        .addStringOption(option => option.setName('reason').setDescription('The reason for rolling back the page').setRequired(false)),

    async execute(interaction) {
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id) && !whitelist.cmod.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.main.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.cmod.includes(interaction.user.id) && !whitelist.localConfig[String(interaction.guildId)]?.whitelist?.rollback.includes(interaction.user.id) && !whitelist.rollback.includes(interaction.user.id)) { await interaction.reply({content:'you\'re not permitted to use this command!', flags: 64}); return;}
        const title = interaction.options.getString('title');
        let wiki = interaction.options.getString('wiki') ? `https://${interaction.options.getString('wiki')}.fandom.com` : login.wiki;
        let lang = interaction.options.getString('lang') ? interaction.options.getString('lang').toLowerCase() : 'en';
        const reason = interaction.options.getString('reason');
        const user = interaction.options.getString('user');
        const mass = interaction.options.getBoolean('mass') || false;
        if (mass && title) {
            await interaction.reply({ content: 'You cannot use both title and mass options at the same time.', flags: 64 });
            return;
        }
        await interaction.deferReply();
        const client = wrapper(axios.create({
            jar: new tough.CookieJar(),
            withCredentials: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'max-age=0'
            }
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

        // const watchToken = csrfTokenRes.data.query.tokens.watchtoken;
        if (mass) {
            const ucRes = await client({
                method: 'get',
                url: `${wiki}/api.php`,
                responseType: 'json',
                params: {
                    action: 'query',
                    list: 'usercontribs',
                    format: 'json',
                    ucuser: user,
                    ucshow: 'top',       
                    uclimit: 500
                }
            });

            const contributions = ucRes.data.query.usercontribs || [];
            if (contributions.length === 0) {
                return interaction.editReply({ content: `No contributions found for user ${user}.` });
            }
            interaction.editReply({
                content: `Starting mass rollback for user ${user}...`
            });

            const tokenRes = await client({
                    method: 'get',
                    url: `${wiki}/api.php`,
                    responseType: 'json',
                    params: {
                        action: 'query',
                        format: 'json',
                        meta: 'tokens',
                        type: 'rollback'
                    }
                });

            const rollbackToken = tokenRes.data.query.tokens.rollbacktoken;
            let str = '';
            let requests = 0;
            for (const contrib of contributions) {
                try {
                    const id = contrib.id;
                    const res = await client({
                        method: 'post',
                        url: `${wiki}/api.php`,
                        responseType: 'json',
                        data: new URLSearchParams({
                            action: 'rollback',
                            format: 'json',
                            pageid: contrib.pageid,
                            user: user,
                            token: rollbackToken,
                            summary: `[DISCORD] Mass rollback of ${user} by ${interaction.user.tag} (${interaction.user.id}): ${reason ? reason : 'No reason provided'}`
                        })
                    });
                    requests++
                    const data = res.data;
                    if (data.error) {
                        //interaction.followUp({ content: `Failed to rollback edit ${contrib.revid} on page ${contrib.title}: ${data.error.code}\n${data.error.info}` });
                        str += `${requests}: [${new Date()}] Failed to rollback edit \`${contrib.revid}\` on page \`${contrib.title}\`: **${data.error.code}**\n**${data.error.info}**\n`;
                    }
                } catch (error) {
                    interaction.editReply({ content: `Failed to rollback edit ${contrib.revid} on page ${contrib.title}: ${error.response ? error.response.data : error.message}` });
                }
                
            }
            const msg = `Mass rollback complete.`+(str ? `\nErrors:\n${str}` : '');
            if (msg.length < 2000) {
                await interaction.editReply({
                    content: msg
                });
            } else {
                const att = new AttachmentBuilder(Buffer.from(msg, 'utf8'),{ name: 'rollback.txt' });

                await interaction.editReply({
                    files: [att]
                });
            }
        }
        if (!mass) {
            const csrfTokenRes = await client({
                method: 'get',
                url: `${wiki}/api.php`,
                responseType: 'json',
                params: {
                    action: 'query',
                    format: 'json',
                    meta: 'tokens',
                    type: 'rollback'
                }   
            });
            const csrfToken = csrfTokenRes.data.query.tokens.rollbacktoken;
            let obj = {
                title: `${title}`,
                action: 'rollback',
                format: 'json',
                token: `${csrfToken}`,
                summary: `[DISCORD] Rolled back ${title} by ${interaction.user.tag}, ${interaction.user.id}: ${reason ? reason : 'No reason provided'}`,
                markbot: true,
                user: `${user}`
            };
            const appendPage = await client({
                method: 'post',
                url: `${wiki}/api.php`,
                responseType: 'text',
                data: new URLSearchParams(obj),
            });

            const appendResponse = JSON.parse(appendPage.data);
            if (appendResponse.error) {
                return interaction.editReply({
                    content: `Rollback failed: ${appendResponse.error.code}\n${appendResponse.error.info}`
                });
            }
            if (appendResponse && appendResponse.rollback) {
                interaction.editReply({ content: `Rolled back page ${title} successfully.` });
            }
        }
    }   
};
