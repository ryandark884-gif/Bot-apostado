const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

let emojis = {};
try {
  emojis = require('../DataBaseJson/emojis.json');
} catch {
  emojis = {};
}

const configPath = path.join(__dirname, '../config.json');
const pagamentosPath = path.join(__dirname, '../DataBaseJson/pagamentos.json');
const permsPath = path.join(__dirname, '../DataBaseJson/perms.json');

function isOwnerOrPermitted(userId) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (config.ownerId === userId) return true;

    if (fs.existsSync(permsPath)) {
      const perms = JSON.parse(fs.readFileSync(permsPath, 'utf-8'));
      return Object.keys(perms).includes(userId);
    }

    return false;
  } catch {
    return false;
  }
}

function getUserPaymentConfig(userId) {
  try {
    if (!fs.existsSync(pagamentosPath)) return null;

    const data = fs.readFileSync(pagamentosPath, 'utf-8');
    const configs = JSON.parse(data);
    return configs[userId] || null;
  } catch {
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pagamentos')
    .setDescription('Gerencie suas configurações de pagamento.'),

  async execute(interaction) {
    if (!isOwnerOrPermitted(interaction.user.id)) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando!',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`${emojis._money_emoji || '💰'} Configurações de Pagamento`)
      .setDescription('Gerencie suas configurações de pagamento de forma rápida e segura.')
      .setThumbnail(interaction.guild?.iconURL() || null)
      .setFooter({
        text: 'Use os botões abaixo para gerenciar.',
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('config_pix')
        .setLabel('Definir Chave PIX')
        .setStyle(ButtonStyle.Primary)
        .setEmoji(emojis._money_emoji || '💰'),

      new ButtonBuilder()
        .setCustomId('ver_config_pix')
        .setLabel('Ver Configurações')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(emojis._settings_emoji || '⚙️')
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};
