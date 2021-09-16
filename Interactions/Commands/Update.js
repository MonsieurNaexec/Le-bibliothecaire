const { CommandInteraction, MessageSelectMenu, MessageActionRow, CategoryChannel } = require('discord.js');
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
    const db = this.commandManager.app.db;
    const guildId = interaction.guildId;
    googleAPI.getForms(guildId).then(async forms => {
      const allBooks = await googleAPI.getAllBooks(guildId);
      if (!db.books[guildId]) db.books[guildId] = {};
      allBooks.forEach(e => {
        db.books[guildId][e.id] = `**${e.book}${(e.title ? ` - ${e.title}` : '')}** dans la catégorie \`${e.category}\``;
      });
      db.save();
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        interaction.editReply(`:clock2: Mise à jour des formulaires (${i + 1}/${forms.length}):\n\`${form.text ?? form.category}\` dans <#${form.channelId}>`);
        const channel = await interaction.guild.channels.fetch(form.channelId);
        const msg = await channel.messages.fetch(form.messageId);
        const books = allBooks.filter(e => e.category == form.category).map(e => {
          let r = { label: e.book, value: `${e.id}` };
          if (e.title) r.description = e.title;
          return r;
        });
        const selector = new MessageSelectMenu()
          .setCustomId('ask_book')
          .setPlaceholder(form.text || form.category);

        books.forEach(e => selector.addOptions(e));
        if (books.length == 0) selector.addOptions({ label: 'Aucun livret n\'est disponible pour le moment', value: 'null' });
        await msg.edit({ content: `Demander un livret pour: \`${selector.placeholder}\``, components: [new MessageActionRow().addComponents(selector)] });
      }
      await interaction.editReply(`:white_check_mark: Mise à jour de ${forms.length} formulaires effectuée!`);
      await interaction.editReply(`:clock2: Annonce des livrets`);

      const books = (await googleAPI.getAllBooks(interaction.guildId)).filter(b => !b.published);
      const notifications = await googleAPI.getNotifications(interaction.guildId);
      let realNbooks = 0;
      let publishedBooks = [];
      let errors = [];
      for (let i = 0; i < books.length; i++) {
        try {
          interaction.editReply(`:clock2: Annonce des livrets (${i + 1}/${books.length})`);
          let b = books[i];
          const book_notifications = notifications.filter(n => n.category == b.category);
          book_notifications.forEach(async n => {
            const channel = await interaction.guild.channels.fetch(n.channelId);
            try {
              if (n.roleId) {
                const role = await interaction.guild.roles.fetch(n.roleId);
                await channel.send(`${role} Un nouveau livret est sorti dans la catégorie \`${b.category}\`: *${b.book}*` + (b.title ? ` - **__${b.title}__**` : ''));
              } else {
                await channel.send(`Un nouveau livret est sorti la catégorie \`${b.category}\`: *${b.book}*` + (b.title ? ` - **__${b.title}__**` : ''));
              }
            } catch (e) {
              errors.push(`:x: Une erreur est survenue pendant l'annonce du livret ${i + 1}: ${e}`);
              throw e;
            }
          });
          if (book_notifications.length) {
            publishedBooks.push(b.id);
            realNbooks++;
          }
        } catch (e) {
          errors.push(`:x: Une erreur est survenue pendant l'annonce du livret ${i + 1}: ${e}`);
        }
      }
      await googleAPI.setBooksPublished(interaction.guild.id, publishedBooks);

      await interaction.editReply(`:white_check_mark: Mise à jour de ${forms.length} formulaires effectuée!\n:white_check_mark: Publication de ${realNbooks} livrets effectuée!`
        + (realNbooks < books.length ? `\n:warning: ${books.length - realNbooks} n'ont pas été publiés car aucun salon ne leur est dédié.` : '')
        + (errors.length ? `\n${errors.join('\n')}` : ''));
    }).catch(async e => {
      console.log(e);
      await interaction.editReply(`:x: Erreur: ${e}`);
    });
  }
}

module.exports = Update;