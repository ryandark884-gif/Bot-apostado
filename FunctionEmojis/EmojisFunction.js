// CORREÇÃO 1: Importar o banco de dados corretamente (certifique-se que o nome do arquivo JSON está certo)
// Se você usa o quick.db ou algo similar, aponte para o arquivo que inicia o banco.
const { Emojis } = require('../DataBaseJson'); 

// CORREÇÃO 2: Ajustando o caminho dos arquivos JSON que você moveu para DataBaseJson
const AllEmojis = [
  ...require('../DataBaseJson/emojis.json'),
  ...require('../DataBaseJson/apostas.json')
];

const axios = require('axios');

async function fetchEmojis(client) {
    try {
        const response = await axios.get(`https://discord.com/api/v9/applications/${client.user.id}/emojis`, {
            headers: {
                Authorization: `Bot ${client.token}`
            }
        });
        return response.data; // Removido o .items pois a API de aplicação retorna um array direto ou objeto diferente
    } catch (e) {
        return [];
    }
}

async function createEmoji(client, name, image) {
    try {
        const response = await axios.post(`https://discord.com/api/v9/applications/${client.user.id}/emojis`, {
            name: name,
            image: image
        }, {
            headers: {
                Authorization: `Bot ${client.token}`
            }
        });

        console.log(`\x1b[32m[Emojis]\x1b\x1b\x1b[0m Erro ao salvar no banco: ${error.message}`);
    }
}

async function UploadEmojis(client) {
    const emojis = await fetchEmojis(client);
    const existingNames = new Set(emojis.map(e => e.name));
    
    // Tenta buscar o que já está salvo no seu banco de dados
    let EmojisSalvos = {};
    try {
        EmojisSalvos = await Emojis.all(); 
    } catch (e) {
        EmojisSalvos = {};
    }

    const uploads = AllEmojis
        .filter(emoji => !existingNames.has(emoji.name)) 
        .map(emoji => createEmoji(client, emoji.name, emoji.image));

    return await Promise.all(uploads);
}

module.exports = {
    GetEmoji,
    UploadEmojis
};
