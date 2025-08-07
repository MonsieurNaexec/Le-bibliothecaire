import { bot } from '#providers/discord_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class StorageController {
  async handle({ request, view, response }: HttpContext) {
    const guildId = request.param('guildId')
    const guild = bot.client.guilds.resolve(guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    return view.render('pages/storage')
  }
}
