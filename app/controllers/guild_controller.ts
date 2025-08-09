import { bot } from '#providers/discord_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class GuildController {
  async settings({ view, params, response, bouncer }: HttpContext) {
    const guild = await bot.getGuild(params.guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildAdministration', guild.id)) {
      return response.forbidden('You do not have permission to access this guild settings')
    }

    const roles = guild.discordGuild?.roles.cache.toJSON()

    return view.render('pages/guild', {
      guild: guild.serialize(),
      roles,
    })
  }

  async updateSettings({ request, response, params, bouncer }: HttpContext) {
    const payload = request.only(['adminRole', 'backendRole', 'storageAlertThreshold'])
    const guild = await bot.getGuild(params.guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildAdministration', guild.id)) {
      return response.forbidden('You do not have permission to update this guild settings')
    }

    if (payload.adminRole)
      guild.adminRoleId = payload.adminRole === 'null' ? null : payload.adminRole
    if (payload.backendRole)
      guild.backendRoleId = payload.backendRole === 'null' ? null : payload.backendRole
    if (payload.storageAlertThreshold !== undefined)
      guild.storageAlertThreshold = Number.parseInt(payload.storageAlertThreshold, 10)

    await guild.save()
    return response.noContent()
  }
}
