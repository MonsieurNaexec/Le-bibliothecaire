import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { PermissionFlagsBits } from 'discord.js'
import { Bot } from '../app/discord/bot.js'

export const API_ENDPOINTS = {
  CURRENT_USER: 'https://discord.com/api/users/@me',
  CURRENT_USER_GUILDS: 'https://discord.com/api/users/@me/guilds',
}

export const bot = new Bot(env.get('DISCORD_BOT_TOKEN'))

export default class DiscordProvider {
  constructor() {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {
    if (app.getEnvironment() !== 'web') return
    await bot.start()
  }

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    if (app.getEnvironment() !== 'web') return
    await bot.stop()
  }
}

export const getBotInviteUrl = () => {
  const clientId = env.get('DISCORD_CLIENT_ID')
  const permissions = PermissionFlagsBits.SendMessages
  const redirectUri = encodeURIComponent(
    env.get('DISCORD_REDIRECT_URL', 'http://localhost:3333/discord/callback')
  )
  return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&redirect_uri=${redirectUri}&integration_type=0&scope=bot`
}
