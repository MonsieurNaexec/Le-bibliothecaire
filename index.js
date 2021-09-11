const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const { CommandManager } = require('./Interactions/CommandManager');
const { SelectMenuManager } = require('./Interactions/SelectMenuManager');
const { ButtonManager } = require('./Interactions/ButtonManager');
const { GoogleAPI } = require('./GoogleAPI');
const fs = require('fs');

exports.Application = class {
  constructor() {
    this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    this.selectMenuManager = new SelectMenuManager(this);
    this.commandManager = new CommandManager(this);
    this.buttonManager = new ButtonManager(this);
    this.googleAPI = new GoogleAPI(this);

    //INIT DATABASE
    const dbSchema = { configurations: {}, books: {} };
    this.db = fs.existsSync('db.json') ? { ...dbSchema, ...JSON.parse(fs.readFileSync('db.json')) } : dbSchema;
    this.db.save = () => { fs.writeFileSync('db.json', JSON.stringify(this.db)) }
    this.db.save();

    this.bookOperations = {};

    this.client.once('ready', async () => {
      console.log('Ready! Connected as ' + this.client.user.tag);
      this.commandManager.registerCommands();
      this.selectMenuManager.registerSelectMenus();
      this.buttonManager.registerButtons();
    });

    this.client.on('interactionCreate', this.commandManager.handleCommand);
    this.client.on('interactionCreate', this.selectMenuManager.handleSelectMenu);
    this.client.on('interactionCreate', this.buttonManager.handleButton);

    this.client.login(token);
  }
}

const app = new exports.Application();