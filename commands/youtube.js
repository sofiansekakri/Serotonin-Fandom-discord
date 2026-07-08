const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yt')
        .setDescription('download a video')
        .addStringOption(command =>
            command.setName('url').setRequired(true).setDescription('yt video url.')
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const whitelist = JSON.parse(
            fs.readFileSync('./sensitive/whitelist.json', 'utf8')
        );

        if (!whitelist.main.includes(interaction.user.id)) {
            await interaction.editReply('you are not authorized to use this command.');
            return;
        }

        const url = interaction.options.getString('url');

        try {
            new URL(url);
        } catch {
            await interaction.editReply('Invalid URL');
            return;
        }

        const tempDir = './assets/yt';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const fileBase = `video_${Date.now()}`;
        const outputTemplate = path.join(tempDir, `${fileBase}.%(ext)s`);

        try {
            await interaction.editReply('Downloading...');

            await youtubedl(url, {
                output: outputTemplate,
                format: 'best[height<=720]',
                mergeOutputFormat: 'mp4'
            });

            const files = fs.readdirSync(tempDir)
                .filter(f => f.startsWith(fileBase) && f.endsWith('.mp4'));

            if (!files.length) {
                await interaction.editReply('Download failed.');
                return;
            }

            const finalPath = path.join(tempDir, files[0]);

            await interaction.editReply({
                content: 'Done.',
                files: [new AttachmentBuilder(finalPath)],
            });
            fs.unlinkSync(finalPath);

        } catch (err) {
            console.error(err);
            await interaction.editReply('Download failed.');
        }
    }
};