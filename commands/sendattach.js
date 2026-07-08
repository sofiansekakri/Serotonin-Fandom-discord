const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { request } = require('undici');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendattach')
        .setDescription('echo your message with an attchment')
        .addAttachmentOption(option => option.setName('attachment').setDescription('The attachment to echo.').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('The message to echo').setRequired(false))
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send the message in').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id) && !whitelist.localConfig[interaction.guildId]?.whitelist?.main?.includes(interaction.user.id))
        {
            await interaction.editReply({ content: 'You are not on the whitelist.', flags: 64 });
            return;
        }
        const attachment = interaction.options.getAttachment('attachment');
        const url = attachment.url;
        /*
            const res = await request(url);
            if (!res || !res.body) return interaction.editReply('An error occured: file couldnt be resolved.');
            const buf = await res.body.arrayBuffer();
        */
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        await channel.send({content: interaction.options.getString('message') ?  interaction.options.getString('message') : '', files: [url]});
        await interaction.editReply({ content: 'done.', flags: 64 });
    }
};