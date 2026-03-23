const { Emojis } = require('../DataBaseJson');
const AllEmojis = [
  ...require('../DataBaseJson/emojis.json'),
  ...require('../DataBaseJson/apostas.json')
];
const axios = require('axios');

async function fetchEmojis(client) {
    try {
        const response = await axios.get(`https://discord.com{client.user.id}/emojis`, {
            headers: {
                Authorization: `Bot ${client.token}`
            }
        });
        return response.data;
    } catch (error) {
        return [];
    }
}

async function createEmoji(client, name, image) {
    try {
        const response = await axios.post(`https://discord.com{client.user.id}/emojis`, {
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

    const uploads = AllEmojis
        .filter(emoji => !existingNames.has(emoji.name))
        .map(emoji => createEmoji(client, emoji.name, emoji.image));

    return await Promise.all(uploads);
}

module.exports = {
    GetEmoji,
    UploadEmojis
};
