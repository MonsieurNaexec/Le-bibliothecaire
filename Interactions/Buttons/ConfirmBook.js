const { ButtonInteraction, MessageActionRow } = require('discord.js');
const { Button } = require('../Button');

class ConfirmBook extends Button {
  constructor(buttonManager) {
    super('confirm_book');
    this.buttonManager = buttonManager;
  }

  /**
   * @param {ButtonInteraction} interaction 
   */
  async execute(interaction) {
    const title = interaction.value;
    interaction.guild.channels.fetch(this.buttonManager.app.db.configurations[interaction.guildId].channel).then(c=>{
      c.send(`***${interaction.member.displayName}*** a demandé **${title}**`);
      interaction.update({content: `:white_check_mark: La demande de **${title}** a bien été envoyée à un responsable`, components: []});
    })
  }
}

module.exports = ConfirmBook;