const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmeme')
        .setDescription('add a meme to the database')
        .addAttachmentOption(option =>
            option
                .setName('img')
                .setDescription('The image')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const whitelist = JSON.parse(fs.readFileSync('./sensitive/whitelist.json', 'utf8'));
        if (!whitelist.main.includes(interaction.user.id)) {
            await interaction.editReply({ content: 'you are not authorized to use this command.' });
            return;
        }
        const attachment = interaction.options.getAttachment('img');
        const response = await fetch(attachment.url);
        const commandFiles = fs.readdirSync('./assets/memes/').filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.gif') || file.endsWith('.webp') || file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.mov'));
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const buffer = Buffer.from(await response.arrayBuffer());
        let str = '';
        let num = commandFiles.length+1;
        while (num > 0) {
            num--;
            str = letters[num % 26] + str;
            num = Math.floor(num / 26);
        }
        const extMatch = attachment.name.toLowerCase().match(/\.(png|jpe?g|webp|gif|mp4|webm|mov)$/);
        if (!extMatch) {
            return interaction.editReply('Only png, jpg, gif, webp, mp4, webm and mov allowed.');
        }

        const ext = extMatch[0];
        const savePath = `./assets/memes/${Date.now()}${ext}`;
        await fs.promises.writeFile(savePath, buffer);
        await interaction.editReply(`Saved meme successfully!`);
    }
};

