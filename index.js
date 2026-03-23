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
const commandFiles = fs.existsSync(commandsPath)
  ? fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
  : [];

for (const file of commandFiles) {
    try {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if (command && command.data && command.execute) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`⚠️ Comando inválido ignorado: ${file}`);
        }
    } catch (err) {
        console.log(`❌ Erro ao carregar comando ${file}:`, err);
    }
}

// 📂 CARREGAMENTO DE EVENTOS
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.existsSync(eventsPath)
  ? fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))
  : [];

for (const file of eventFiles) {
    try {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event && event.name && event.execute) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        } else {
            console.log(`⚠️ Evento inválido ignorado: ${file}`);
        }
    } catch (err) {
        console.log(`❌ Erro ao carregar evento ${file}:`, err);
    }
}

// 🚀 REGISTRO DE COMANDOS SLASH (NO SERVIDOR)
const rest = new REST().setToken(TOKEN);

(async () => {
    try {
        console.log('🚀 Registrando comandos slash...');

        const commands = [];
        for (const file of commandFiles) {
            try {
                const command = require(`./commands/${file}`);
                if (command && command.data && typeof command.data.toJSON === 'function') {
                    commands.push(command.data.toJSON());
                }
            } catch (err) {
                console.log(`❌ Erro no comando ${file}:`, err);
            }
        }

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );

        console.log('✅ Comandos registrados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
})();

// 🛡️ TRATAMENTO DE ERROS (NÃO DEIXA O BOT CAIR)
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

// 🔑 BOT ONLINE
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// 🔑 LOGIN
client.login(TOKEN);
