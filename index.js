require('./config');

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const TOKEN = process.env.TOKEN || config.token;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

client.commands = new Collection();
client.cooldowns = new Collection();

// 📂 CARREGAMENTO DE COMANDOS
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// 📂 CARREGAMENTO DE EVENTOS
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const rest = new REST().setToken(TOKEN);

// 🚀 REGISTRO DE COMANDOS SLASH (INSTANTÂNEO NO SERVIDOR)
(async () => {
    try {
        console.log('Iniciando registro dos comandos slash no servidor...');

        const commands = [];
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            if (command && command.data && typeof command.data.toJSON === 'function') {
                commands.push(command.data.toJSON());
            }
        }

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );

        console.log('Comandos slash registrados com sucesso no servidor!');
    } catch (error) {
        console.error('Erro ao registrar comandos:', error);
    }
})();

// 🛡️ TRATAMENTO DE ERROS (EVITA QUE O BOT CAIA)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// 🔑 LOGIN
client.login(TOKEN);
