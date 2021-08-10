const { ButtonInteraction, MessageActionRow } = require('discord.js');
const { Button } = require('../Button');

class DenyBook extends Button {
  constructor(selectMenuManager) {
    super('deny_book');
    this.selectMenuManager = selectMenuManager;
  }

  /**
   * 
   * @param {ButtonInteraction} interaction 
   */
  execute(interaction) {
    interaction.update({content: ':x: La commande a été annulée. Tu peux sélectionner un autre livret ou ne rien faire.', components: []});
  }
}

module.exports = DenyBook;