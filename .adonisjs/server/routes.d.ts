import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home.index': { paramsTuple?: []; params?: {} }
    'login.login': { paramsTuple?: []; params?: {} }
    'login.logout': { paramsTuple?: []; params?: {} }
    'login.discord_callback': { paramsTuple?: []; params?: {} }
    'login.discord_invite': { paramsTuple?: []; params?: {} }
    'guild.settings': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.update_settings': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.add_announcement_channel': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.update_announcement_channel': { paramsTuple: [ParamValue,ParamValue]; params: {'guildId': ParamValue,'announcementChannelId': ParamValue} }
    'guild.delete_announcement_channel': { paramsTuple: [ParamValue,ParamValue]; params: {'guildId': ParamValue,'announcementChannelId': ParamValue} }
    'guild.add_group_role': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.delete_group_role': { paramsTuple: [ParamValue,ParamValue]; params: {'guildId': ParamValue,'groupRoleId': ParamValue} }
    'guild.publish': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.publish.submit': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.create_form': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.storage': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.add_category': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.edit_category': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.delete_category': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.reset_category': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.add_book': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.edit_book': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.delete_book': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.queries': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'queries.delete_query': { paramsTuple: [ParamValue,ParamValue]; params: {'guildId': ParamValue,'queryId': ParamValue} }
  }
  GET: {
    'home.index': { paramsTuple?: []; params?: {} }
    'login.login': { paramsTuple?: []; params?: {} }
    'login.logout': { paramsTuple?: []; params?: {} }
    'login.discord_callback': { paramsTuple?: []; params?: {} }
    'login.discord_invite': { paramsTuple?: []; params?: {} }
    'guild.settings': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.publish': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.storage': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.queries': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
  }
  HEAD: {
    'home.index': { paramsTuple?: []; params?: {} }
    'login.login': { paramsTuple?: []; params?: {} }
    'login.logout': { paramsTuple?: []; params?: {} }
    'login.discord_callback': { paramsTuple?: []; params?: {} }
    'login.discord_invite': { paramsTuple?: []; params?: {} }
    'guild.settings': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.publish': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.storage': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.queries': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
  }
  PATCH: {
    'guild.update_settings': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.update_announcement_channel': { paramsTuple: [ParamValue,ParamValue]; params: {'guildId': ParamValue,'announcementChannelId': ParamValue} }
    'storage.edit_category': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.edit_book': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
  }
  POST: {
    'guild.add_announcement_channel': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.add_group_role': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.publish.submit': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'guild.create_form': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.add_category': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.reset_category': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.add_book': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
  }
  DELETE: {
    'guild.delete_announcement_channel': { paramsTuple: [ParamValue,ParamValue]; params: {'guildId': ParamValue,'announcementChannelId': ParamValue} }
    'guild.delete_group_role': { paramsTuple: [ParamValue,ParamValue]; params: {'guildId': ParamValue,'groupRoleId': ParamValue} }
    'storage.delete_category': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'storage.delete_book': { paramsTuple: [ParamValue]; params: {'guildId': ParamValue} }
    'queries.delete_query': { paramsTuple: [ParamValue,ParamValue]; params: {'guildId': ParamValue,'queryId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}