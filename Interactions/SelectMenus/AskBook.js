const { SelectMenuInteraction, MessageButton, MessageActionRow } = require('discord.js');
const { SelectMenu } = require('../SelectMenu');

class AskBook extends SelectMenu {
  constructor(selectMenuManager) {
    super('ask_book');
    this.selectMenuManager = selectMenuManager;
  }

  /**
   * 
   * @param {SelectMenuInteraction} interaction 
   */
  async execute(interaction) {
    if (interaction.values.length != 1) {
      interaction.reply({ content: ":x: Une erreur s'est produite :/ Le nombre de livrets n'est pas valide", ephemeral: true });
      return;
    }
    
    if (interaction.values[0] == 'null') {
      interaction.reply({ content: ":x: Aucun livret n'est disponible dans cette catégorie pour l'instant...", ephemeral: true });
      return;
    }


    const btnConfirm = new MessageButton()
      .setCustomId('confirm_book:' + interaction.values[0])
      .setLabel('Oui, confirmer la commande')
      .setStyle('SUCCESS');

    const btnDeny = new MessageButton()
      .setCustomId('deny_book:' + interaction.values[0])
      .setLabel('Non, je me suis trompé')
      .setStyle('DANGER');

    interaction.reply({
      content: `Tu as demandé **${interaction.values[0]}**, est-ce bien ça?`,
      ephemeral: true,
      components: [new MessageActionRow().addComponents([btnConfirm, btnDeny])],
    });
  }
}

module.exports = AskBook;