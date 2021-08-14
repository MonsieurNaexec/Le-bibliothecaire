const { CommandInteraction } = require('discord.js');
const { Command } = require("../Command");
const { CommandManager } = require('../CommandManager');

/**
 * @extends {Command}
 */
class Setup extends Command {
  /**
   * @param {CommandManager} manager 
   */
  constructor(commandManager) {
    super('setup', 'Démarre la configuration du bibliothécaire');
    this.commandManager = commandManager;
    this.addOption('url', 'L\'url de la google sheet à associer avec ce serveur', 'STRING');
    this.addOption('channel', 'Le salon dans lequel seront envoyées toutes les demandes', 'CHANNEL');
  }

  /**
   * @param {CommandInteraction} interaction 
   */
  async execute(interaction) {
    await interaction.reply({ content: ":clock2: Vérification et création des feuilles de données...", ephemeral: true });

    const spreadsheetId = interaction.options.getString('url');

    const doc = await this.commandManager.app.googleAPI.openSpreadsheet(spreadsheetId);
    if (doc) {
      const db = this.commandManager.app.db;
      if (!db.configurations[interaction.guildId]) db.configurations[interaction.guildId] = {};
      db.configurations[interaction.guildId].spreadsheet = spreadsheetId;
      db.configurations[interaction.guildId].channel = interaction.options.getChannel('channel').id;
      db.save();
      this.commandManager.app.googleAPI.documents[guildId] = doc;
      interaction.editReply(`:white_check_mark: Configuration terminée! Spreadsheet: \`${doc.title}\``);
    } else {
      interaction.editReply(":warning: L'URL de la feuille est mauvaise, ou je n'y ai pas accès!");
    }
  }
}

module.exports = Setup;