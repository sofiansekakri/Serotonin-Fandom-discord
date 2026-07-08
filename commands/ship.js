const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { randomInt } = require('../modules-custom/math');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('ship two users')
        .addUserOption(option =>
            option.setName('user_1')
                .setDescription('the user to ship')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('user_2')
                .setDescription('the user to ship')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const { GlobalFonts } = require('@napi-rs/canvas');
        GlobalFonts.registerFromPath(path.resolve(__dirname, '../assets/fonts/Roboto-VariableFont_wdth,wght.ttf'), 'sans-serif');        
        const safeFail = async (msg) => {
            try {
                return await interaction.editReply(msg);
            } catch (e) {

            }
        };

        try {
            const users = [
                interaction.options.getUser('user_1'),
                interaction.options.getUser('user_2')
            ];

            const rnd = randomInt(0, 100);

            const canvas = Canvas.createCanvas(700, 250);
            const ctx = canvas.getContext('2d');

            // background (safe load)
            let background;
            try {
                background = await Canvas.loadImage(
                    path.resolve(__dirname, '../assets/ships/shippingmainbg.jpg')
                );
            } catch (e){
                background = null;
            }

            if (background) {
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.strokeStyle = '#ff00fb';
            ctx.lineWidth = 5;
            //ctx.strokeRect(0, 0, canvas.width, canvas.height);

            const fetchAvatar = async (user) => {
                try {
                    const url = user.displayAvatarURL({ extension: 'png', size: 256 });
                    const res = await request(url);

                    if (!res || !res.body) return null;

                    const buf = await res.body.arrayBuffer();
                    if (!buf || buf.byteLength === 0) return null;

                    return await Canvas.loadImage(Buffer.from(buf));
                } catch (e) {
                    return null;
                }
            };

            const [a1, a2] = await Promise.all([
                fetchAvatar(users[0]),
                fetchAvatar(users[1])
            ]);

            const fallbackAvatar = (x) => {
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(x, 125, 100, 0, Math.PI * 2);
                ctx.fill();
            };

            const drawAvatar = (img, x) => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, 125, 100, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                if (img) {
                    ctx.drawImage(img, x - 100, 25, 200, 200);
                } else {
                    fallbackAvatar(x);
                }

                ctx.restore();

                ctx.beginPath();
                ctx.arc(x, 125, 100, 0, Math.PI * 2);
                ctx.stroke();
            };

            drawAvatar(a1, 125);
            drawAvatar(a2, 575);

            ctx.font = '60px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${rnd}%`, canvas.width / 2, canvas.height / 2);

            let buffer;
            try {
                buffer = canvas.toBuffer('image/png');
            } catch (e) {
                console.error('Canvas encode failed:', e);
                return safeFail('Image generation failed.');
            }

            const attachment = new AttachmentBuilder(buffer, {
                name: 'ship.png'
            });

            return await interaction.editReply({
                content: `${rnd}% ❤️`,
                files: [attachment]
            });

        } catch (err) {
            console.error('SHIP COMMAND CRASH:', err);
            return safeFail('Command failed safely.');
        }
    }
};
