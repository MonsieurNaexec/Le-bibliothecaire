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
    const guildBooks = this.buttonManager.app.db.books[interaction.guildId];
    const title = guildBooks ? (guildBooks[interaction.value] || interaction.value) : interaction.value;
    console.log("Confirm value: ", interaction.value, "Title:", title);
    
    interaction.guild.channels.fetch(this.buttonManager.app.db.configurations[interaction.guildId].channel).then(c => {
      c.send(`***${interaction.member.displayName}*** a demandé ${title}`).then(() => {
        interaction.update({ content: `:white_check_mark: La demande de ${title} a bien été envoyée à un responsable`, components: [] });
      }).catch(e => {
        console.log(e);
        interaction.update({ content: `:x: Une erreur est survenue, la demande a potentiellement échoué... Merci d'avertir un responsable au plus vite!`, components: [] });
      });
    })
  }
}

module.exports = ConfirmBook;