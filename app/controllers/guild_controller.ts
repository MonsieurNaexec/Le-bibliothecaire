import AnnouncementChannel from '#models/announcement_channel'
import { bot } from '#providers/discord_provider'
import {
  createAnnouncementChannelValidator,
  updateAnnouncementChannelValidator,
} from '#validators/announcements'
import type { HttpContext } from '@adonisjs/core/http'

export default class GuildController {
  async settings({ view, params, response, bouncer }: HttpContext) {
    const guild = await bot.getGuild(params.guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildAdministration', guild.id)) {
      return response.forbidden('You do not have permission to access this guild settings')
    }

    const roles = guild.discordGuild?.roles.cache.toJSON()
    const channels = guild.discordGuild?.channels.cache
      .filter((channel) => channel.isTextBased())
      .toJSON()

    await guild.load('announcementChannels')

    return view.render('pages/guild', {
      guild: guild.serialize({
        relations: { announcementChannel: { fields: ['channelId', 'mentionRoleId'] } },
      }),
      roles,
      channels,
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

  async addAnnouncementChannel({ request, response, params, bouncer }: HttpContext) {
    const guild = await bot.getGuild(params.guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildAdministration', guild.id)) {
      return response.forbidden('You do not have permission to add an announcement channel')
    }

    const data = await createAnnouncementChannelValidator.validate(request.all())

    AnnouncementChannel.create({
      guildId: !data.categoryId ? guild.id : null,
      categoryId: data.categoryId ?? null,
      channelId: data.channelId,
      mentionRoleId: data.mentionRoleId ?? null,
    })

    return response.redirect().back()
  }

  async updateAnnouncementChannel({ request, response, params, bouncer }: HttpContext) {
    const guild = await bot.getGuild(params.guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildAdministration', guild.id)) {
      return response.forbidden('You do not have permission to update this announcement channel')
    }

    const data = await updateAnnouncementChannelValidator.validate(request.all())

    const announcementChannel = await AnnouncementChannel.findOrFail(params.announcementChannelId)
    if (announcementChannel.guildId !== guild.id) {
      return response.notFound('Announcement channel not found in this guild')
    }

    if (data.channelId !== undefined) {
      announcementChannel.channelId = data.channelId
    }
    if (data.mentionRoleId !== undefined) {
      announcementChannel.mentionRoleId = data.mentionRoleId ?? null
    }

    await announcementChannel.save()
    return response.redirect().back()
  }

  async deleteAnnouncementChannel({ params, response, bouncer }: HttpContext) {
    const guild = await bot.getGuild(params.guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildAdministration', guild.id)) {
      return response.forbidden('You do not have permission to delete this announcement channel')
    }

    const announcementChannel = await AnnouncementChannel.findOrFail(params.announcementChannelId)
    if (announcementChannel.guildId !== guild.id) {
      return response.notFound('Announcement channel not found in this guild')
    }

    await announcementChannel.delete()
    return response.redirect().back()
  }
}
