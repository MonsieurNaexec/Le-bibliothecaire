const { local_guild, local_deploy, remote_deploy } = require('../config.json');
const path = require('path');
const fs = require('fs');
const { CommandInteraction } = require('discord.js');

exports.CommandManager = class {
  constructor(app) {
    this.app = app;
    this.commands = [];
    this.handleCommand = this.handleCommand.bind(this);
  }

  registerCommands() {
    const data = [];

    const directoryPath = path.join(__dirname, 'Commands');
    const files = fs.readdirSync(directoryPath);

    files.forEach(f => {
      const Command = require('./Commands/' + f);
      const command = new Command(this)
      this.commands.push(command);
      data.push(command.exportData());
    });

    if (local_deploy) this.app.client.guilds.resolve(local_guild)?.commands.set(data);
    else if(remote_deploy) this.app.client.application?.commands.set(data);
  }

  /**
   * 
   * @param {CommandInteraction} interaction 
   * @returns 
   */
  handleCommand(interaction) {
    if (!interaction.isCommand()) return;
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      interaction.reply({ content: ":x: Vous devez être administrateur de ce serveur pour utiliser cette commande!", ephemeral: true });
      return;
    }
    this.commands.find(c => c.name == interaction.commandName)?.execute(interaction);
  }
}