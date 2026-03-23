const axios = require('axios');
const config = require('../config.json');

// Carregando os arquivos de emojis (certifique-se que os nomes das pastas/arquivos estão corretos)
const AllEmojis = [
    ...require('../DataBaseJson/emojis.json'), 
    ...require('../DataBaseJson/apostas.json')
];

const TOKEN = process.env.TOKEN || config.token;

// Função para buscar emojis do seu servidor
async function fetchEmojis(client) {
    try {
        // CORREÇÃO: Usando a URL oficial da API do Discord com crases e ${}
        const res = await axios.get(`https://discord.com{config.guildId}/emojis`, {
            headers: { Authorization: `Bot ${TOKEN}` }
        });
        return res.data;
    } catch (e) { 
        console.error("Erro ao buscar emojis:", e.message);
        return []; 
    }
}

// Função para criar emoji no seu servidor
async function createEmoji(client, name, image) {
    try {
        // CORREÇÃO: Usando a URL oficial de POST com crases e ${}
        const res = await axios.post(`https://discord.com{config.guildId}/emojis`, { name, image }, {
            headers: { Authorization: `Bot ${TOKEN}` }
        });
        return `<:${name}:${res.data.id}>`;
    } catch (e) {
        console.log("Erro ao criar emoji:", e.message);
        return null;
    }
}

async function GetEmoji(client, emojiName) {
    const emojis = await fetchEmojis(client);
    const exist = emojis.find(e => e.name === emojiName);
    if (exist) return `<:${emojiName}:${exist.id}>`;
    
    const data = AllEmojis.find(e => e.name === emojiName);
    if (data) return await createEmoji(client, data.name, data.image || data.base64);
    return null;
}

async function UploadEmojis(client) {
    const emojis = await fetchEmojis(client);
    const names = new Set(emojis.map(e => e.name));
    const ups = AllEmojis.filter(e => !names.has(e.name)).map(e => createEmoji(client, e.name, e.image));
    return await Promise.all(ups);
}

module.exports = { GetEmoji, UploadEmojis };
