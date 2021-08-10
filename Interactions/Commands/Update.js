const { CommandInteraction, MessageSelectMenu, MessageActionRow } = require('discord.js');
const { GoogleAPI } = require('../../GoogleAPI');
const { Command } = require("../Command");
const { CommandManager } = require('../CommandManager');

/**
 * @extends {Command}
 */
class Update extends Command {
  /**
   * @param {CommandManager} commandManager 
   */
  constructor(commandManager) {
    super('update', 'Mettre à jour la liste des livrets');
    this.commandManager = commandManager;
  }

  /**
   * @param {CommandInteraction} interaction 
   */
  async execute(interaction) {
    await interaction.reply({ content: ":clock2: Début de la mise à jour...", ephemeral: true });
    /**
     * @type {GoogleAPI}
     */
    const googleAPI = this.commandManager.app.googleAPI;
    googleAPI.getForms(interaction.guildId).then(async forms=>{
      for(let i = 0; i < forms.length; i++){
        const form = forms[i];
        interaction.editReply(`:clock2: Mise à jour des formulaires (${i+1}/${forms.length}):\n\`${form.text ?? form.category}\` dans <#${form.channelId}>`);
        const channel = await interaction.guild.channels.fetch(form.channelId);
        const msg = await channel.messages.fetch(form.messageId);
        const books = await googleAPI.getBooksByCat(interaction.guildId, form.category);
        const selector = new MessageSelectMenu()
          .setCustomId('ask_book')
          .setPlaceholder(form.text || form.category);

        books.forEach(e => selector.addOptions(e));
        if (books.length == 0) selector.addOptions({label: 'Aucun livret n\'est disponible pour le moment', value: 'null'});
        msg.edit({ content: `Demander un livre pour: \`${selector.placeholder}\``, components: [new MessageActionRow().addComponents(selector)] });
      }
      interaction.editReply(`:white_check_mark: Mise à jour de ${forms.length} formulaires effectuée!`);
    }).catch(async e => {
      console.log(e);
      await interaction.editReply(`:x: Erreur: ${e}`);
    });
  }
}

module.exports = Update;