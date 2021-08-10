class Button {
  constructor(name) {
    this.name = name;
  }

  execute(interaction) {
    interaction.reply({ content: "Ce bouton n'est pas encore implémenté :/", ephemeral: true });
  }
}

exports.Button = Button;