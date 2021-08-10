const { CommandInteraction } = require('discord.js');
const { Command } = require("../Command");
const { CommandManager } = require('../CommandManager');

/**
 * @extends {Command}
 */
class Notification extends Command {
  /**
   * @param {CommandManager} commandManager 
   */
  constructor(commandManager) {
    super('notification', 'Annoncer les sorties de livrets dans ce salon');
    this.commandManager = commandManager;
    this.addOption('categorie', 'La catégorie de livrets à notifier', 'STRING');
    this.addOption('annoncer', 'Annoncer les livrets maintenant?', 'BOOLEAN');
  }

  /**
   * @param {CommandInteraction} interaction 
   */
  execute(interaction) {
    super.execute(interaction);
  }
}

module.exports = Notification;