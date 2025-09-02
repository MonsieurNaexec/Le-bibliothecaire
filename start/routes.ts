/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { bot } from '#providers/discord_provider'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const LoginController = () => import('#controllers/login_controller')
const HomeController = () => import('#controllers/home_controller')
const StorageController = () => import('#controllers/storage_controller')
const QueriesController = () => import('#controllers/queries_controller')
const GuildController = () => import('#controllers/guild_controller')

router.get('/', [HomeController, 'index'])
router.get('/login', [LoginController, 'login'])
router.get('/logout', [LoginController, 'logout'])
router.get('/discord/callback', [LoginController, 'discord_callback'])
router.get('/discord/invite', [LoginController, 'discord_invite'])

router
  .group(() => {
    router
      .group(() => {
        router.get('/guild/:guildId', [GuildController, 'settings']).as('guild.settings')
        router.patch('/guild/:guildId', [GuildController, 'updateSettings'])

        router.post('/guild/:guildId/announcement_channel', [
          GuildController,
          'addAnnouncementChannel',
        ])
        router.patch('/guild/:guildId/announcement_channel/:announcementChannelId', [
          GuildController,
          'updateAnnouncementChannel',
        ])
        router.delete('/guild/:guildId/announcement_channel/:announcementChannelId', [
          GuildController,
          'deleteAnnouncementChannel',
        ])
        router.post('/guild/:guildId/group_role', [GuildController, 'addGroupRole'])
        router.delete('/guild/:guildId/group_role/:groupRoleId', [
          GuildController,
          'deleteGroupRole',
        ])
        router.post('/guild/:guildId/publish', [GuildController, 'publish'])
        router.post('/guild/:guildId/form', [GuildController, 'createForm'])

        router.get('/guild/:guildId/storage', [StorageController, 'handle']).as('guild.storage')
        router.post('/guild/:guildId/storage', [StorageController, 'addCategory'])
        router.patch('/guild/:guildId/storage', [StorageController, 'editCategory'])
        router.delete('/guild/:guildId/storage', [StorageController, 'deleteCategory'])

        router.post('/guild/:guildId/storage/books', [StorageController, 'addBook'])
        router.patch('/guild/:guildId/storage/books', [StorageController, 'editBook'])
        router.delete('/guild/:guildId/storage/books', [StorageController, 'deleteBook'])

        router.get('/guild/:guildId/queries', [QueriesController, 'handle']).as('guild.queries')
        router.delete('/guild/:guildId/query/:queryId', [QueriesController, 'deleteQuery'])
      })
      .use(async (ctx, next) => {
        ctx.view.share({ guild: await bot.getGuild(ctx.params.guildId) })
        const user = ctx.auth.user
        if (!user) return next()
        await user.load('lastGuild')
        if (ctx.params.guildId !== user.lastGuild?.id) {
          user.lastGuildId = ctx.params.guildId
          await user.save()
        }
        return next()
      })
  })
  .use(middleware.auth())
