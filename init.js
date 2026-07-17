((login) => {
    const fs = require('fs');
    const path = require('path');
    const { Client, Events, GatewayIntentBits, SlashCommandBuilder, Collection, MessageFlags, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
    const axios = require('axios');
    const { wrapper } = require('axios-cookiejar-support');
    const tough = require('tough-cookie');
    const cron = require('node-cron');
    let mwlogin = require('./sensitive/mwlogin.json');
    const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    const apiClient = wrapper(axios.create({
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
    const status = JSON.parse(fs.readFileSync('./sensitive/status.json', 'utf8')).status || 'online';
    const activityType = JSON.parse(fs.readFileSync('./sensitive/status.json', 'utf8')).activityType || 'Watching';
    const activityName = JSON.parse(fs.readFileSync('./sensitive/status.json', 'utf8')).activityName || 'Fandom.com';
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
    });
    client.once(Events.ClientReady, (readyClient) => {
        readyClient.user.setPresence({
            activities: [{ name: activityName, type: ActivityType[activityType] }],
            status: status,
        });

        //console.log('Ready.');

        const startup = `[SYS] Boot ${new Date().toISOString()}\n`;

        fs.appendFile(
            path.join(__dirname, 'logs/cmds.log'),
            startup,
            (err) => {
                if (err) console.error(err);
            }
        );
        const memes = fs.readdirSync('./assets/memes/').filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.gif') || file.endsWith('.webp') || file.endsWith('mp4') || file.endsWith('.webm') || file.endsWith('.mov'));
               
        const guilds = client.guilds.cache.map(guild => `**${guild.id}** (**${guild.name}**): **<@${guild.ownerId}>**`);
        client.channels.cache.get('1510297407936532640').send(`${startup.replace('[SYS]', '**[SYS]**')}**[CLIENT]** Logged in as ${readyClient.user.tag} (${readyClient.user.id}); Serving ${guilds.length} guilds.\n**[CLIENT]** Loaded ${memes.length} memes.\n`);
        client.channels.cache.get('1510297407936532640').send({ embeds: [new EmbedBuilder().setTitle(`Guilds: ${guilds.length}`).setDescription(`${guilds.join(', ')}`)] });


        client.channels.cache.get('1527765589462876280').send(`${startup.replace('[SYS]', '**[SYS]**')}**[CLIENT]** Logged in as ${readyClient.user.tag} (${readyClient.user.id}); Serving ${guilds.length} guilds.\n**[CLIENT]** Loaded ${memes.length} memes.\n`);
        client.channels.cache.get('1527765589462876280').send({ embeds: [new EmbedBuilder().setTitle(`Guilds: ${guilds.length}`).setDescription(`${guilds.join(', ')}`)] });
        //console.log('Guild Amount:', guilds.length);

        //console.log('Attempting to obtain Fandom Login Token.');

        (async function getLoginToken() {
            mwlogin.wiki = 'https://community.fandom.com';

            const loginTokenRes = await apiClient({
                method: 'get',
                url: `${mwlogin.wiki}/api.php`,
                responseType: 'json',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                params: {
                    action: 'query',
                    format: 'json',
                    meta: 'tokens',
                    type: 'login'
                }
            });

            if (loginTokenRes.data.query && loginTokenRes.data.query.tokens && loginTokenRes.data.query.tokens.logintoken) {
                //console.log('Login token obtained successfully.');
            } else {
                console.log('Failed to obtain login token.');
                return;
            }

            const loginToken = loginTokenRes.data.query.tokens.logintoken;

            const loginRes = await apiClient({
                method: 'post',
                url: `${mwlogin.wiki}/api.php`,
                responseType: 'json',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: new URLSearchParams({
                    action: 'login',
                    format: 'json',
                    lgname: mwlogin.username,
                    lgpassword: mwlogin.password,
                    lgtoken: loginToken
                })
            });

            const loginResult = loginRes.data.login.result;

            if (loginResult === 'Success') {
                //console.log('Logged in successfully.');
            } else {
                console.log('Failed to login.');
                return;
            }

            const csrfTokenRes = await apiClient({
                method: 'get',
                url: `${mwlogin.wiki}/api.php`,
                responseType: 'json',
                params: {
                    action: 'query',
                    format: 'json',
                    meta: 'tokens'
                }
            });

            const csrfToken = csrfTokenRes.data.query.tokens.csrftoken;

            if (csrfToken) {
                //console.log('CSRF token obtained successfully.');

                const str = JSON.stringify({
                    main: whitelist.main
                }, null, 2);

                await apiClient({
                    method: 'post',
                    url: `${mwlogin.wiki}/api.php`,
                    responseType: 'text',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    data: new URLSearchParams({
                        action: 'edit',
                        format: 'json',
                        title: 'User:CrazyBotAcc/whitelist.json',
                        text: `${str}`,
                        token: csrfToken,
                        summary: '[DISCORD] Updating whitelist.',
                        bot: true
                    })
                });

                cron.schedule('*/10 * * * *', async () => {
                    await (async () => {
                        const apiClient = wrapper(axios.create({
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

                        mwlogin.wiki = 'https://community.fandom.com';

                        const loginTokenRes = await apiClient({
                            method: 'get',
                            url: `${mwlogin.wiki}/api.php`,
                            responseType: 'json',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            params: {
                                action: 'query',
                                format: 'json',
                                meta: 'tokens',
                                type: 'login'
                            }
                        });

                        if (loginTokenRes.data.query && loginTokenRes.data.query.tokens && loginTokenRes.data.query.tokens.logintoken) {
                            //console.log('Login token obtained successfully.');
                        } else {
                            console.log('Failed to obtain login token.');
                            return;
                        }

                        const loginToken = loginTokenRes.data.query.tokens.logintoken;

                        await apiClient({
                            method: 'post',
                            url: `${mwlogin.wiki}/api.php`,
                            responseType: 'json',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            data: new URLSearchParams({
                                action: 'login',
                                format: 'json',
                                lgname: mwlogin.username,
                                lgpassword: mwlogin.password,
                                lgtoken: loginToken
                            })
                        });

                        const PagesRes = await apiClient({
                            method: 'get',
                            url: `https://community.fandom.com/api.php`,
                            responseType: 'json',
                            params: {
                                action: 'query',
                                format: 'json',
                                list: 'search',
                                srsearch: 'User_talk:CrazyBotAcc/appeals/open/',
                                srlimit: 500
                            }
                        });

                        const pagesList = PagesRes.data.query.search;

                        for (const page of pagesList) {

                            const newTitle = page.title.replace(
                                'User_talk:CrazyBotAcc/appeals/open/',
                                'User_talk:CrazyBotAcc/appeals/delivered/'
                            );

                            const content = await apiClient({
                                method: 'get',
                                url: `https://community.fandom.com/api.php`,
                                responseType: 'json',
                                params: {
                                    action: 'query',
                                    format: 'json',
                                    prop: 'revisions',
                                    rvprop: 'content',
                                    titles: page.title
                                }
                            });

                            const pagesObj = content.data.query.pages;
                            const pageId = Object.keys(pagesObj)[0];
                            const pageContent = pagesObj[pageId].revisions[0]['*'];

                            const txt = `# ${newTitle.replace('User_talk:CrazyBotAcc/appeals/delivered', '')}\n\n${pageContent}`;

                            const csrfTokenRes2 = await apiClient({
                                method: 'get',
                                url: `https://community.fandom.com/api.php`,
                                responseType: 'json',
                                params: {
                                    action: 'query',
                                    format: 'json',
                                    meta: 'tokens'
                                }
                            });

                            const csrfToken2 = csrfTokenRes2.data.query.tokens.csrftoken;

                            const moveRes = await apiClient({
                                method: 'post',
                                url: `https://community.fandom.com/api.php`,
                                responseType: 'json',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                data: new URLSearchParams({
                                    action: 'move',
                                    format: 'json',
                                    from: page.title,
                                    to: newTitle,
                                    token: csrfToken2,
                                    reason: '[DISCORD] Marking appeal as delivered.',
                                    movetalk: true
                                })
                            });

                            const moveResult = moveRes.data.move ? moveRes.data.move.result : null;

                            if (moveResult === 'success') {
                                //console.log(`Moved page ${page.title} successfully.`);
                            } else {
                                //console.log(`Failed to move page ${page.title}.`);
                            }

                            const accept = new ButtonBuilder()
                                .setCustomId('Accept')
                                .setLabel('Accept')
                                .setStyle(ButtonStyle.Secondary);

                            const reject = new ButtonBuilder()
                                .setCustomId('Reject')
                                .setStyle(ButtonStyle.Danger)
                                .setLabel('Reject');

                            const row = new ActionRowBuilder().addComponents(accept, reject);

                            const embed = new EmbedBuilder()
                                .setTitle(newTitle.replace('User_talk:CrazyBotAcc/appeals/delivered/', ''))
                                .setDescription(
                                    pageContent.length > 4096
                                        ? pageContent.substring(0, 4093) + '...'
                                        : pageContent
                                )
                                .setURL(`https://community.fandom.com/wiki/${newTitle.replace(/ /g, '_')}`);

                            client.channels.cache.get('1510355665040969809')
                                .send({ embeds: [embed], components: [row] });
                        }
                    })();
                });
                
            } else {
                console.log('Failed to obtain CSRF token.');
                return;
            }
        })();

    });

    client.commands = new Collection();

    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
        else console.log(filePath);
    }

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const cmd = `[CMD] /${interaction.commandName} UserID: ${interaction.user.id}, UserTag: ${interaction.user.tag}, GuildID: ${interaction.guildId}, Options: ${JSON.stringify(interaction.options.data)}`;

        //console.log(cmd);

        fs.appendFile(
            path.join(__dirname, 'logs/cmds.log'),
            `${cmd}\n`,
            (err) => {
                if (err) console.error(err);
            }
        );
        client.channels.cache.get('1510297407936532640')
            .send(`**[CMD]** /**${interaction.commandName}** UserID: **${interaction.user.id}**, UserTag: **${interaction.user.tag}**, GuildID: **${interaction.guildId}**, Options: \`\`\`js\n${JSON.stringify(interaction.options.data)}\n\`\`\``);

        client.channels.cache.get('1527765589462876280')
            .send(`**[CMD]** /**${interaction.commandName}** UserID: **${interaction.user.id}**, UserTag: **${interaction.user.tag}**, GuildID: **${interaction.guildId}**, Options: \`\`\`js\n${JSON.stringify(interaction.options.data)}\n\`\`\``);
        
        const Whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        const command = client.commands.get(interaction.commandName);

        if (!command) return;
        const lockdown = JSON.parse(fs.readFileSync('./sensitive/lockdown.json')); 
        if (lockdown['dbLock'] && !Whitelist.main.includes(interaction.user.id)) {
            await interaction.reply({ content: 'Commands have been disabled temporarely for technical reasons.' });
            return;
        }
        if ((!Whitelist.main.includes(interaction.user.id) && !Whitelist.cmod.includes(interaction.user.id) && !Whitelist.rollback.includes(interaction.user.id)) && (Whitelist.blacklist.includes(interaction.user.id) || (Whitelist.localConfig[String(interaction.guildId)] && Whitelist.localConfig[String(interaction.guildId)].blacklist.includes(interaction.user.id) && !Whitelist.main.includes(interaction.user.id) && !Whitelist.localConfig[String(interaction.guildId)].whitelist.main.includes(interaction.user.id)))) {
            await interaction.reply({ content: 'You are blacklisted.' });
            return;
        }
        if (Whitelist.guilds.blacklist.includes(String(interaction.guildId)) && !Whitelist.main.includes(interaction.user.id)) {
            await interaction.reply({ content: 'This server is blacklisted.' });
            return;
        } else if (Whitelist.main.includes(interaction.user.id) && Whitelist.guilds.blacklist.includes(String(interaction.guildId))) {
            await client.channels.cache.get(interaction.channelId).send(`<@${interaction.user.id}>**careful**: you have global main access but the server is blacklisted. Will attempt to execute now.`);
        }
        /*
        await interaction.deferReply({ ephemeral: true });
        interaction.deferReply = async (opt) => { return opt; };
        interaction.reply = interaction.editReply;
        */
        await command.execute(interaction).catch((error) => {
            console.error(error);

            fs.appendFile(
                path.join(__dirname, 'logs/cmds.log'),
                `[ERR] ${error.message} UserID: ${interaction.user.id}, UserTag: ${interaction.user.tag}, GuildID: ${interaction.guildId}, Command: /${interaction.commandName}\n`,
                (err) => {
                    if (err) console.error(err);
                }
            );

            client.channels.cache.get('1510297407936532640')
                .send(`**[ERR]** \`${error.message}\` UserID: **${interaction.user.id}**, UserTag: **${interaction.user.tag}**, GuildID: **${interaction.guildId}**, Command: /**${interaction.commandName}**`);
            client.channels.cache.get('1527765589462876280')
                .send(`**[ERR]** \`${error.message}\` UserID: **${interaction.user.id}**, UserTag: **${interaction.user.tag}**, GuildID: **${interaction.guildId}**, Command: /**${interaction.commandName}**`);
            });
        /*
        const wiki = wrapper(axios.create({
            jar: new tough.CookieJar(),
            withCredentials: true
        }));

        const loginTokenRes = await wiki.get(
            'https://backrooms-freewriting.fandom.com/api.php',
            {
                params: {
                    action: 'query',
                    meta: 'tokens',
                    type: 'login',
                    format: 'json'
                }
            }
        );

        const loginToken = loginTokenRes.data?.query?.tokens?.logintoken;

        if (!loginToken) {
            //console.error('Failed to obtain login token.');
            //console.error(loginTokenRes.data);
            return;
        }

        const loginRes = await wiki.post(
            'https://backrooms-freewriting.fandom.com/api.php',
            new URLSearchParams({
                action: 'login',
                lgname: mwlogin.secusername,
                lgpassword: mwlogin.secpassword,
                lgtoken: loginToken,
                format: 'json'
            })
        );

        //console.log('Login response:', loginRes.data);

        if (loginRes.data?.login?.result !== 'Success') {
            //console.error('Login failed.');
            return;
        }

        const userInfoRes = await wiki.get(
            'https://backrooms-freewriting.fandom.com/api.php',
            {
                params: {
                    action: 'query',
                    meta: 'userinfo',
                    format: 'json'
                }
            }
        );

        //console.log('User info:', userInfoRes.data);

        const csrfRes = await wiki.get(
            'https://backrooms-freewriting.fandom.com/api.php',
            {
                params: {
                    action: 'query',
                    meta: 'tokens',
                    format: 'json'
                }
            }
        );

        //console.log('Token response:', csrfRes.data);

        const csrfToken = csrfRes.data?.query?.tokens?.csrftoken;

        if (!csrfToken || csrfToken === '+\\') {
            //console.error('Failed to obtain CSRF token.');
            return;
        }

        const editRes = await wiki.post(
            'https://backrooms-freewriting.fandom.com/api.php',
            new URLSearchParams({
                action: 'edit',
                title: 'User:Crazybloy2/EXEC_CMD.css',
                text: JSON.stringify({
                    main: new Date()
                }, null, 2),
                token: csrfToken,
                summary: '[DISCORD] EXEC_CMD',
                format: 'json'
            })
        );

        //console.log('Edit response:', editRes.data);

        if (editRes.data?.edit?.result === 'Success') {
            //console.log('Page edited successfully.');
        } else {
            //console.error('Edit failed.');
        }
            */
    });

    client.login(login.token);
})(require('./sensitive/login.json'));