const { Emojis } = require('../DataBaseJson');
const config = require('../config.json'); // Importei o config para pegar o guildId
const AllEmojis = [...require('../DataBaseJson/emojis.json'), ...require('../DataBaseJson/apostas.json')];
const axios = require('axios');

// Função para buscar emojis do seu servidor
async function fetchEmojis(client) {
    try {
        // Corrigido: Agora usa a URL oficial da API do Discord e o ID do seu servidor
        const res = await axios.get(`https://discord.com{config.guildId}/emojis`, {
            headers: { Authorization: `Bot ${client.token}` }
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
        // Corrigido: Agora usa a URL oficial para POST (criação)
        const res = await axios.post(`https://discord.com{config.guildId}/emojis`, { name, image }, {
            headers: { Authorization: `Bot ${client.token}` }
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
    // Corrigido: Verifica se existe data antes de tentar criar
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
