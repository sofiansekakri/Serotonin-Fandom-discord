const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const child_process = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nmap')
        .setDescription('scan a network.')
        .addStringOption(option =>
            option.setName('target')
                .setDescription('the target (url or IP) to scan')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.reply('this command is currently disabled for security reasons.');
        return;
        await interaction.reply('Starting nmap scan...');

        const whitelist = JSON.parse(
            fs.readFileSync('./sensitive/whitelist.json', 'utf8')
        );

        if (!whitelist.main.includes(interaction.user.id)) {
            return interaction.editReply({
                content: 'you are not authorized to use this command.'
            });
        }

        const target = interaction.options.getString('target');

        const blocked = [
            /localhost/,
            /127\.0\.0\.1/,
            /::1/,
            /0\.0\.0\.0/,
            /169\.254\.\d{1,3}\.\d{1,3}/,
            /192\.168\.\d{1,3}\.\d{1,3}/,
            /10\.\d{1,3}\.\d{1,3}\.\d{1,3}/
        ];

        if (blocked.some(r => r.test(target))) {
            return interaction.editReply({ content: 'Blocked target.' });
        }

        const nmap = child_process.spawn('nmap', ['-p-', '-T4', target]);

        let output = '';
        let errorOutput = '';

        const timeout = setTimeout(() => {
            nmap.kill('SIGKILL');
        }, 30000);

        nmap.stdout.on('data', (data) => {
            output += data.toString();
        });

        nmap.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        nmap.on('error', async () => {
            clearTimeout(timeout);
            await interaction.editReply('Failed to start nmap process.');
        });

        nmap.on('close', async (code) => {
            clearTimeout(timeout);

            const finalOutput = errorOutput
                ? `ERROR LOG:\n${errorOutput}\n\nOUTPUT:\n${output}`
                : output;

            const buffer = Buffer.from(finalOutput, 'utf8');

            if (buffer.length > 8 * 1024 * 1024) {
                return interaction.editReply({
                    content: 'Output too large to send.'
                });
            }

            const file = new AttachmentBuilder(buffer, {
                name: `nmap-${Date.now()}.txt`
            });

            await interaction.editReply({
                content: `Scan finished (exit code ${code}).`,
                files: [file]
            });
        });
    }
};