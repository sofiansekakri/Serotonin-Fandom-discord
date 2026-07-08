const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const login = require('./sensitive/login.json');
const whitelist = require('./sensitive/whitelist.json');

let commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if (!command.data) {
        console.warn(`Skipping ${file}: no "data" export`);
        continue;
    }

    commands.push(command.data.toJSON());
}

/*for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}
*/
const rest = new REST({ version: '10' }).setToken(login.token);

(async () => {
    try {
        /*
        for (const guild of whitelist.guilds) {
            await rest.put(
            Routes.applicationGuildCommands(login.clientId, guild),
            { body: commands },);
        }
        */
        await rest.put(Routes.applicationCommands(login.clientId), { body: commands });

        console.log('Guild commands deployed.');
    } catch (error) {
        console.error(error);
    }
})();
