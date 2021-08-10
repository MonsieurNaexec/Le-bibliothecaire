const { CommandInteraction } = require('discord.js');
const { GoogleAPI } = require('../../GoogleAPI');
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
    this.addOption('role', 'Role à mentionner lors des annonces', 'ROLE', false);
  }

  /**
   * @param {CommandInteraction} interaction 
   */
  execute(interaction) {
    /**
     * @type {GoogleAPI}
     */
    interaction.reply({ content: ':clock2: Enregistrement du salon d\'annnonce...', ephemeral: true })
    const googleAPI = this.commandManager.app.googleAPI;
    googleAPI.addNotification(
      interaction.guildId,
      interaction.options.getString('categorie'),
      interaction.channelId,
      interaction.options.getRole('role', false)?.id,
      interaction.channel.name,
      interaction.options.getRole('role', false)?.name
    ).then(e => {
      interaction.editReply(`:white_check_mark: Ce salon recevra les annonces pour la catégorie \`${interaction.options.getString('categorie')}\``);
    }).catch(e => {
      console.log(e);
      interaction.editReply(`:x: Erreur: ${e}`);
    });
  }
}

module.exports = Notification;