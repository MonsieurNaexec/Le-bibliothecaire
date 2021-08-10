/**
 * @class
 */
class Command {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.options = [];
  }

  addOption(name, description = '', type = 'STRING', required = true) {
    let option = {
      name,
      type,
      description,
      required
    };
    this.options.push(option);
    return option;
  }

  exportData() {
    let data = { name: this.name, description: this.description };
    if (this.options.length > 0) data.options = this.options;
    return data;
  }

  execute(interaction) {
    interaction.reply({ content: "Cette commande n'est pas encore implémentée :/", ephemeral: true });
  }
}

exports.Command = Command;