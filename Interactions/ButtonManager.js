const { ButtonInteraction } = require('discord.js');
const { Button } = require('./Button');
const path = require('path');
const fs = require('fs');

exports.ButtonManager = class {
  constructor(app) {
    this.app = app;
    /**
     * @type {Button[]}
     */
    this.buttons = [];
    this.handleButton = this.handleButton.bind(this);
  }

  registerButtons() {
    const directoryPath = path.join(__dirname, 'Buttons');
    const files = fs.readdirSync(directoryPath);

    files.forEach(f => {
      const MButton = require('./Buttons/' + f);
      const button = new MButton(this)
      this.buttons.push(button);
    });
  }

  /**
   * @param {ButtonInteraction} interaction 
   * @returns 
   */
  handleButton(interaction) {
    if (!interaction.isButton()) return;
    const customIdPayload = interaction.customId.split(':');
    const buttonId = customIdPayload[0];
    interaction.value = customIdPayload.length > 1 ? customIdPayload[1] : '';
    let button = this.buttons.find(b => b.name == buttonId);
    button ? button.execute(interaction) : interaction.reply({ content: 'Ce bouton ne fonctionne pas ou plus :/', ephemeral: true });
  }
}