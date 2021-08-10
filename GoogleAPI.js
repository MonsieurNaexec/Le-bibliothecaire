const { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } = require('google-spreadsheet');
const credentials = require('./google_credentials.json');

exports.GoogleAPI = class {
  /**
   * 
   * @param {Application} app 
   */
  constructor(app) {
    this.app = app;
    this.documents = {};
  }

  async openSpreadsheet(id) {
    const doc = new GoogleSpreadsheet(id);
    await doc.useServiceAccountAuth(credentials);

    try {
      await doc.loadInfo(); // loads document properties and worksheets
    } catch {
      console.log("err");
      return false;
    }

    const ws_books = await this.getWorksheet(doc, 'Livrets');
    await this.setWorksheetHeader(ws_books, ['Catégorie', 'Livre', 'Titre (optionnel)', 'Publié (bot)']);

    const ws_forms = await this.getWorksheet(doc, 'Formulaires');
    await this.setWorksheetHeader(ws_forms, ['Catégorie', 'ChannelID', 'MessageID', 'Salon', 'Texte']);

    const ws_notifications = await this.getWorksheet(doc, 'Annonces');
    await this.setWorksheetHeader(ws_notifications, ['Catégorie', 'ChannelID', 'RoleID', 'Salon', 'Mention']);

    return doc;
  }

  /**
   * 
   * @param {GoogleSpreadsheet} doc 
   * @param {string} title 
   * @returns 
   */
  async getWorksheet(doc, title) {
    await doc.loadInfo();
    return (doc.sheetsByTitle[title] || (await doc.addSheet({ title })));
  }

  /**
   * 
   * @param {GoogleSpreadsheetWorksheet} sheet 
   * @param {string[]} header 
   */
  async setWorksheetHeader(sheet, header) {
    await sheet.setHeaderRow(header);
    await sheet.loadCells({ startColumnIndex: 0, endColumnIndex: header.length });
    for (let i = 0; i < header.length; i++) {
      sheet.getCell(0, i).horizontalAlignment = "CENTER";
      sheet.getCell(0, i).textFormat = { bold: true };
    }
    await sheet.saveUpdatedCells();
  }

  async getBooksByCat(guildId, category) {
    if (!this.documents[guildId]) {
      if (this.app.db.configurations[guildId]) this.documents[guildId] = await this.openSpreadsheet(this.app.db.configurations[guildId].spreadsheet);
      else throw "La feuille de données n'est pas configurée correctement! Utilisez `/setup {URL}` pour l'initialiser";
    }
    const books_ws = await this.getWorksheet(this.documents[guildId], 'Livrets');
    books_ws.loadCells({ startColumnIndex: 0, endColumnIndex: 4 });
    const books = await books_ws.getRows();
    return books.filter(e => (e['Catégorie'] == category && e['Livre'])).map(e => {
      let r = { label: e['Livre'], value: e['Livre'] + (e['Titre (optionnel)'] ? ` - ${e['Titre (optionnel)']}` : '') };
      if (e['Titre (optionnel)']) r.description = e['Titre (optionnel)'];
      return r;
    });
  }

  async getAllBooks(guildId){
    if (!this.documents[guildId]) {
      if (this.app.db.configurations[guildId]) this.documents[guildId] = await this.openSpreadsheet(this.app.db.configurations[guildId].spreadsheet);
      else throw "La feuille de données n'est pas configurée correctement! Utilisez `/setup {URL}` pour l'initialiser";
    }
    const books_ws = await this.getWorksheet(this.documents[guildId], 'Livrets');
    books_ws.loadCells({ startColumnIndex: 0, endColumnIndex: 4 });
    const books = await books_ws.getRows();
    return books.filter(e => (e['Livre'])).map(e => ({id: e.rowIndex, category: e['Catégorie'], book: e['Livre'], title: e['Titre (optionnel)'], published: e['Publié (bot)']}));
  }

  async setBookPublished(guildId, bookId){
    if (!this.documents[guildId]) {
      if (this.app.db.configurations[guildId]) this.documents[guildId] = await this.openSpreadsheet(this.app.db.configurations[guildId].spreadsheet);
      else throw "La feuille de données n'est pas configurée correctement! Utilisez `/setup {URL}` pour l'initialiser";
    }
    const books_ws = await this.getWorksheet(this.documents[guildId], 'Livrets');
    await books_ws.loadCells({ startColumnIndex: 3, endColumnIndex: 4 });
    books_ws.getCell(bookId - 1, 3).value = 'TRUE';
    await books_ws.saveUpdatedCells();
  }

  async addForm(guildId, category, id, channel, text) {
    if (!this.documents[guildId]) {
      if (this.app.db.configurations[guildId]) this.documents[guildId] = await this.openSpreadsheet(this.app.db.configurations[guildId].spreadsheet);
      else throw "La feuille de données n'est pas configurée correctement! Utilisez `/setup {URL}` pour l'initialiser";
    }
    const forms_ws = await this.getWorksheet(this.documents[guildId], 'Formulaires');
    forms_ws.addRow([category, id, channel, text]);
  }

  async getForms(guildId) {
    if (!this.documents[guildId]) {
      if (this.app.db.configurations[guildId]) this.documents[guildId] = await this.openSpreadsheet(this.app.db.configurations[guildId].spreadsheet);
      else throw "La feuille de données n'est pas configurée correctement! Utilisez `/setup {URL}` pour l'initialiser";
    }
    const forms_ws = await this.getWorksheet(this.documents[guildId], 'Formulaires');
    forms_ws.loadCells({ startColumnIndex: 0, endColumnIndex: 5 });
    const forms = await forms_ws.getRows();
    return forms
      .filter(e => (e['Catégorie'] && e['MessageID']))
      .map(e => ({ category: e['Catégorie'], channelId: e['ChannelID'], messageId: e['MessageID'], text: e['Texte'] }));
  }

  async addNotification(guildId, category, channelId, roleId, channel, role) {
    if (!this.documents[guildId]) {
      if (this.app.db.configurations[guildId]) this.documents[guildId] = await this.openSpreadsheet(this.app.db.configurations[guildId].spreadsheet);
      else throw "La feuille de données n'est pas configurée correctement! Utilisez `/setup {URL}` pour l'initialiser";
    }
    const notifications_ws = await this.getWorksheet(this.documents[guildId], 'Annonces');
    notifications_ws.addRow([category, channelId, roleId, channel, role]);
  }

  async getNotifications(guildId) {
    if (!this.documents[guildId]) {
      if (this.app.db.configurations[guildId]) this.documents[guildId] = await this.openSpreadsheet(this.app.db.configurations[guildId].spreadsheet);
      else throw "La feuille de données n'est pas configurée correctement! Utilisez `/setup {URL}` pour l'initialiser";
    }
    const notifications_ws = await this.getWorksheet(this.documents[guildId], 'Annonces');
    notifications_ws.loadCells({ startColumnIndex: 0, endColumnIndex: 3 });
    const notifications = await notifications_ws.getRows();
    return notifications
      .filter(e => (e['Catégorie'] && e['ChannelID']))
      .map(e => ({ category: e['Catégorie'], channelId: e['ChannelID'], roleId: e['RoleID'] }));
  }
}