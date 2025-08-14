import AnnouncementChannel from '#models/announcement_channel'
import Book from '#models/book'
import { bot } from '#providers/discord_provider'
import {
  createAnnouncementChannelValidator,
  updateAnnouncementChannelValidator,
} from '#validators/announcements'
import { updateSettingsValidator } from '#validators/settings'
import type { HttpContext } from '@adonisjs/core/http'
import { roleMention } from 'discord.js'
import { DateTime } from 'luxon'

export default class GuildController {
  async settings({ view, params, response, bouncer }: HttpContext) {
    const guild = await bot.getGuild(params.guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildAdministration', guild.id)) {
      return response.forbidden('You do not have permission to access this guild settings')
    }

    const roles = guild.discordGuild?.roles.cache.toJSON()
    const channels = guild.discordGuild?.channels.cache
      .filter(
        (channel) =>
          channel.isTextBased() &&
          channel.guild.members.me &&
          channel.permissionsFor(channel.guild.members.me.id)?.has('SendMessages')
      )
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
    const data = await updateSettingsValidator.validate(request.all())
    const guild = await bot.getGuild(params.guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildAdministration', guild.id)) {
      return response.forbidden('You do not have permission to update this guild settings')
    }

    if (data.adminRoleId) guild.adminRoleId = data.adminRoleId === 'null' ? null : data.adminRoleId
    if (data.backendRoleId)
      guild.backendRoleId = data.backendRoleId === 'null' ? null : data.backendRoleId
    if (data.storageAlertThreshold !== undefined)
      guild.storageAlertThreshold = data.storageAlertThreshold
    if (data.queryNotificationChannelId)
      guild.queryNotificationChannelId =
        data.queryNotificationChannelId === 'null' ? null : data.queryNotificationChannelId
    if (data.queryNotificationMentionRoleId)
      guild.queryNotificationMentionRoleId =
        data.queryNotificationMentionRoleId === 'null' ? null : data.queryNotificationMentionRoleId

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

  async publish({ params, response, bouncer, logger }: HttpContext) {
    const guild = await bot.getGuild(params.guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildBackend', guild.id)) {
      return response.forbidden('You do not have permission to publish in this guild')
    }

    const books = await Book.query()
      .join('book_categories', 'book_categories.id', 'category_id')
      .join('announcement_channels', (query) => {
        query
          .on('announcement_channels.category_id', 'book_categories.id')
          .orOn('announcement_channels.guild_id', 'book_categories.guild_id')
      })
      .where('book_categories.guild_id', guild.id)
      .andWhereNull('publishedAt')
      .select(
        'books.*',
        'book_categories.name as category_name',
        'announcement_channels.channel_id as announcement_channel_id',
        'announcement_channels.mention_role_id as announcement_mention_role_id'
      )

    const channels: {
      [key: string]: {
        mentions: {
          [key: string]: {
            categories: {
              [key: string]: Book[]
            }
          }
        }
      }
    } = {}

    for (const book of books) {
      const channelId = book.$extras.announcement_channel_id
      const mentionRoleId = book.$extras.announcement_mention_role_id ?? 'null'
      const categoryName = book.$extras.category_name

      if (!channels[channelId]) {
        channels[channelId] = {
          mentions: {},
        }
      }
      if (!channels[channelId].mentions[mentionRoleId]) {
        channels[channelId].mentions[mentionRoleId] = {
          categories: {},
        }
      }
      if (!channels[channelId].mentions[mentionRoleId].categories[categoryName]) {
        channels[channelId].mentions[mentionRoleId].categories[categoryName] = []
      }
      channels[channelId].mentions[mentionRoleId].categories[categoryName].push(book)
    }

    const errors: string[] = []

    for (const channelId in channels) {
      const channel = guild.discordGuild?.channels.resolve(channelId)
      if (!channel || !channel.isTextBased()) continue

      for (const mentionRoleId in channels[channelId].mentions) {
        const role = guild.discordGuild?.roles.resolve(mentionRoleId)
        const mention = !role
          ? ''
          : role.name === '@everyone'
            ? '@everyone '
            : `${roleMention(mentionRoleId)} `
        const categories = channels[channelId].mentions[mentionRoleId].categories

        let message = `# 📚 ${mention}De nouveaux livrets sont disponibles\n`

        const categoryNames = Object.keys(categories).sort((a, b) => a.localeCompare(b))
        for (const categoryName of categoryNames) {
          const categoryBooks = categories[categoryName].sort((a, b) =>
            a.title.localeCompare(b.title)
          )
          message += `## ${categoryName}\n`
          for (const book of categoryBooks) {
            message += book.description
              ? `- **${book.title} :** ${book.description}\n`
              : `- **${book.title}**\n`
          }
        }

        try {
          await channel.send({
            content: message,
          })
        } catch (error) {
          logger.error(
            { error },
            `Failed to send message to channel "${channel.name}": ${error.message}`
          )
          errors.push(`Failed to send message to channel "${channel.name}": ${error.message}`)
        }
      }
    }

    if (errors.length > 0) {
      return response.internalServerError(
        "Some announcements couldn't be sent:\n" + errors.map((e) => `- ${e}`).join('\n')
      )
    }

    await Book.query()
      .whereIn(
        'id',
        books.map((book) => book.id)
      )
      .update({
        publishedAt: DateTime.now().toISO(),
      })

    return response.redirect().back()
  }
}
