const { CommandInteraction, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { Command } = require("../Command");
const { CommandManager } = require('../CommandManager');

/**
 * @extends {Command}
 */
class Form extends Command {
  /**
   * @param {CommandManager} commandManager 
   */
  constructor(commandManager) {
    super('formulaire', 'Créer un formulaire de demande dans ce salon');
    this.commandManager = commandManager;
    this.addOption('categorie', 'La catégorie de livrets à inclure dans le formulaire', 'STRING');
    this.addOption('texte', 'Le texte à afficher (par défaut, la catégorie)', 'STRING', false);
  }

  /**
   * @param {CommandInteraction} interaction 
   */
  async execute(interaction) {
    await interaction.reply({ content: ':clock2: Création du formulaire...', ephemeral: true });
    const cat = interaction.options.getString('categorie');
    this.commandManager.app.googleAPI.getBooksByCat(interaction.guildId, cat).then(
      async data => {
        const selector = new MessageSelectMenu()
          .setCustomId('ask_book')
          .setPlaceholder(interaction.options.getString('texte', false) || cat);

        data.forEach(e => selector.addOptions(e));
        if (data.length == 0) selector.addOptions({label: 'Aucun livret n\'est disponible pour le moment', value: 'null'});

        const msg = await interaction.channel.send({ content: `Demander un livre pour: \`${selector.placeholder}\``, components: [new MessageActionRow().addComponents(selector)] });

        this.commandManager.app.googleAPI.addForm(msg.guildId, cat, msg.id, msg.channel.name, interaction.options.getString('texte', false));

        await interaction.editReply(':white_check_mark: Le formulaire a été créé!');
      }
    ).catch(async e => {
      console.log(e);
      await interaction.editReply(`:x: Erreur: ${e}`);
    });
  }
}

module.exports = Form;