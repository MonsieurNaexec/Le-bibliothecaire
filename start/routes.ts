/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import User from '#models/user'
import { getBotInviteUrl } from '#providers/discord_provider'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const HomeController = () => import('#controllers/home_controller')
const StorageController = () => import('#controllers/storage_controller')
const QueriesController = () => import('#controllers/queries_controller')
const GuildController = () => import('#controllers/guild_controller')

router.get('/login', ({ ally }) => {
  return ally.use('discord').redirect((req) => {
    req.scopes(['identify', 'guilds'])
  })
})
router.get('/logout', async ({ auth, response }) => {
  await auth.use('web').logout()
  return response.redirect('/')
})
router.get('/discord/callback', async ({ auth, ally, response, logger }) => {
  const discord = ally.use('discord')

  if (discord.accessDenied()) return 'You have cancelled the login process'
  if (discord.stateMisMatch()) return 'We are unable to verify the request. Please try again'
  if (discord.hasError()) return discord.getError()

  const discordUser = await discord.user()
  logger.debug({ discordUser }, 'Logged in with Discord')

  const user = await User.updateOrCreate(
    { id: discordUser.id },
    {
      nickname: discordUser.original.global_name ?? discordUser.nickName,
      avatarUrl: discordUser.avatarUrl,
      token: discordUser.token,
    }
  )
  await user.getGuilds(true)
  await auth.use('web').login(user)
  return response.redirect('/')
})
router.get('/discord/invite', ({ response }) => {
  return response.redirect(getBotInviteUrl())
})

router
  .group(() => {
    router.get('/', [HomeController, 'index'])
    router
      .group(() => {
        router.get('/guild/:guildId', [GuildController, 'settings']).as('guild.settings')
        router.patch('/guild/:guildId', [GuildController, 'updateSettings'])

        router.get('/guild/:guildId/storage', [StorageController, 'handle']).as('guild.storage')
        router.post('/guild/:guildId/storage', [StorageController, 'addCategory'])
        router.patch('/guild/:guildId/storage', [StorageController, 'editCategory'])
        router.delete('/guild/:guildId/storage', [StorageController, 'deleteCategory'])

        router.post('/guild/:guildId/storage/books', [StorageController, 'addBook'])
        router.patch('/guild/:guildId/storage/books', [StorageController, 'editBook'])
        router.delete('/guild/:guildId/storage/books', [StorageController, 'deleteBook'])

        router.get('/guild/:guildId/queries', [QueriesController, 'handle']).as('guild.queries')
      })
      .use(async (ctx, next) => {
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
