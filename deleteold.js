const { REST, Routes } = require('discord.js');
const login = require('./sensitive/login.json');

const rest = new REST({ version: '10' }).setToken(login.token);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(login.clientId),
            { body: [] } // delete all global commands.
        );
        console.log('All global commands deleted.');
    } catch (error) {
        console.error(error);
    }
})();
