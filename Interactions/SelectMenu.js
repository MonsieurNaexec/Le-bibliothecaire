class SelectMenu {
  constructor(name) {
    this.name = name;
  }

  execute(interaction) {
    interaction.reply({ content: "Ce sélecteur n'est pas encore implémenté :/", ephemeral: true });
  }
}

exports.SelectMenu = SelectMenu;