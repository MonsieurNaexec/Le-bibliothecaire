import { bot } from '#providers/discord_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class GuildController {
  async settings({ view, params, response, auth }: HttpContext) {
    const guild = await bot.getGuild(params.id)
    if (!guild) return response.notFound('Guild not found or not joined')
    const member = await guild.discordGuild?.members.fetch({ user: auth.user!.id })
    if (!member) return response.notFound('You are not a member of this guild')
    const isAdmin = member.permissions.has('Administrator')
    const adminRole = guild.adminRoleId && member.roles.resolve(guild.adminRoleId)

    if (!isAdmin && !adminRole) {
      return response.forbidden('You do not have permission to access this guild settings')
    }

    const roles = guild.discordGuild?.roles.cache.toJSON()

    return view.render('pages/guild', {
      guild: {
        id: guild.id,
        name: guild.discordGuild?.name,
        iconUrl: guild.discordGuild?.iconURL(),
        adminRoleId: guild.adminRoleId,
        backendRoleId: guild.backendRoleId,
      },
      roles,
    })
  }

  async updateSettings({ request, response, params }: HttpContext) {
    const payload = request.only(['adminRole', 'backendRole'])
    const guild = await bot.getGuild(params.id)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (payload.adminRole)
      guild.adminRoleId = payload.adminRole === 'null' ? null : payload.adminRole
    if (payload.backendRole)
      guild.backendRoleId = payload.backendRole === 'null' ? null : payload.backendRole

    await guild.save()
    return response.noContent()
  }
}
