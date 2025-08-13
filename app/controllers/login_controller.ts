import User from '#models/user'
import { getBotInviteUrl } from '#providers/discord_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  async login({ ally, logger, response }: HttpContext) {
    logger.debug('Redirecting to Discord for login')
    await ally.use('discord').redirect((req) => {
      req.scopes(['identify', 'guilds'])
    })
    logger.debug(response.getBody())
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/')
  }

  async discord_callback({ ally, auth, response, logger }: HttpContext) {
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
  }

  async discord_invite({ response }: HttpContext) {
    response.redirect(getBotInviteUrl())
  }
}
