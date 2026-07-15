const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const child_process = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('show debug logs'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) { await interaction.editReply({content:'you are not authorized to use this command.'}); return;}
        child_process.exec('journalctl -u BOT-DISCORD -b', { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
            if (error) {
                interaction.editReply({ content: `Error: \n\`\`\`\n${error.message}\n\`\`\``, flags: 64 });
                return;
            } else if (stderr) {
                interaction.editReply({ content: `Stderr: \n\`\`\`\n${stderr}\n\`\`\``, flags: 64 });
                return;
            } else if (stdout) {
                if (stdout.length < 1990) {
                    interaction.editReply({ content: `\n\`\`\`\n${stdout}\n\`\`\``, flags: 64 });
                    return;
                } 
                const buffer = Buffer.from(stdout, 'utf8');
                const file = new AttachmentBuilder(buffer, {
                    name: 'output.txt'
                });
                interaction.editReply({ files: [file]});
            }
        });  
    }
};