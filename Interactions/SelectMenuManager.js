const { SelectMenuInteraction } = require('discord.js');
const { SelectMenu } = require('./SelectMenu');
const path = require('path');
const fs = require('fs');

exports.SelectMenuManager = class {
  constructor(app) {
    this.app = app;
    /**
     * @type {SelectMenu[]}
     */
    this.selectMenus = [];
    this.handleSelectMenu = this.handleSelectMenu.bind(this);
  }

  registerSelectMenus() {
    const directoryPath = path.join(__dirname, 'SelectMenus');
    const files = fs.readdirSync(directoryPath);

    files.forEach(f => {
      const MSelectMenu = require('./SelectMenus/' + f);
      const selectMenu = new MSelectMenu(this)
      this.selectMenus.push(selectMenu);
    });
  }

  /**
   * 
   * @param {SelectMenuInteraction} interaction 
   * @returns 
   */
  handleSelectMenu(interaction) {
    if (!interaction.isSelectMenu()) return;
    let selector = this.selectMenus.find(s => s.name == interaction.customId);
    selector ? selector.execute(interaction) : interaction.reply({ content: 'Ce sélecteur ne fonctionne pas ou plus :/', ephemeral: true });
  }
}