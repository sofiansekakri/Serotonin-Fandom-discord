const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const login = require('../sensitive/mwlogin.json');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('profile') 
    .setDescription('view a user\'s profile')
    .addStringOption(option => option.setName('username').setDescription('The username of the user to view').setRequired(true))
    .addStringOption(option => option.setName('wiki').setDescription('The wiki to view the profile on (optional)').setRequired(false))
    .addStringOption(option => option.setName('lang').setDescription('The language of the wiki to view the profile on (optional)').setRequired(false)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        let wiki = interaction.options.getString('wiki') ? `https://${interaction.options.getString('wiki')}.fandom.com` : 'https://community.fandom.com';
        let lang = interaction.options.getString('lang') ? interaction.options.getString('lang').toLowerCase() : 'en';
        if (!username) {
            await interaction.reply({ content: 'Please provide a username.', flags: 64 });
            return;
        }
        if (whitelist.localConfig[String(interaction.guildId)]) {
            wiki = `https://${whitelist.localConfig[String(interaction.guildId)].wiki}.fandom.com`;
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
        if (loginResult !== 'Success') {
            interaction.editReply({ content: 'Failed to login.' });
            return;
        }

        const userData = await client({
            method: 'get',
            url: `${wiki}/api.php`,
            responseType: 'json',
            params: {
                action: 'query',
                format: 'json',
                list: 'users',
                ususers: username,
                usprop: 'blockinfo|groups|editcount|registration|gender'
            }   
        });
        if (userData.data.query.users[0].missing === '') {
            interaction.editReply({ content: 'User not found.' });
            return;
        }
        const user = userData.data.query.users[0];
        const userId = user.userid;
        
        const serviceApiRes = await client({
            method: 'get',
            responseType: 'json',
            url: `https://services.fandom.com/user-attribute/user/${userId}`
        });

        const userAttributes = serviceApiRes.data['_embedded'].properties || [];
        const gblockedRes = await client({
            method: 'get',
            url: `${wiki}/api.php`,
            params: {
                action:'parse',
                format:'json',
                text:`{{:Special:Contributions/${username}}}`
            }
        });

        const gblocked = gblockedRes.data.parse.text['*'].includes('<div class=\"userprofile mw-warning-with-logexcerpt\">This user is currently blocked across the Fandom network.</div>');
        
        const disabledAcc = gblockedRes.data.parse.text['*'].includes('<div class=\"errorbox\">This account has been disabled globally by ');
        // [5]
        const profileEmbed = new EmbedBuilder()
            .setURL(`${wiki}/wiki/User:${username.replace(/ /g, '_')}`)
            .setTitle(`${user.name}`)
            .setDescription(`**Nick**: ${userAttributes[5]?.value || '_empty_'}\n\n**Bio**: ${userAttributes[1]?.value || '_empty_'}\n\n**Groups**: ${user.groups.join(', ')}\n\n**Edit Count**: ${user.editcount}\n\n**ID**: ${userId}\n\n**Registered**: ${new Date(user.registration).toUTCString()}\n\n**Gender**: ${user.gender || '_unknown_'}\n\n**Globally Blocked**: ${gblocked ? 'Yes' : 'No'}\n\n**Account Disabled**: ${disabledAcc ? 'Yes' : 'No'}`).setThumbnail(userAttributes[0]?.value);
            
        await interaction.editReply({ embeds: [profileEmbed] });
    }
}