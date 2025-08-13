/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| You may export multiple abilities from this file and pre-register them
| when creating the Bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

import type User from '#models/user'
import { bot } from '#providers/discord_provider'
import { Bouncer } from '@adonisjs/bouncer'
import { PermissionFlagsBits } from 'discord.js'

export const accessGuildBackend = Bouncer.ability(async (user: User, guildId: string) => {
  const guild = await bot.getGuild(guildId)
  if (!guild) return false

  if (!guild.discordGuild) return false
  let member = guild.discordGuild.members.resolve(user.id)
  if (!member) {
    await guild.discordGuild.members.fetch()
    member = guild.discordGuild.members.resolve(user.id)
  }

  return (
    !!member &&
    (member.permissions.has(PermissionFlagsBits.Administrator) ||
      (guild.adminRoleId !== null && !!member.roles.resolve(guild.adminRoleId)) ||
      (guild.backendRoleId !== null && !!member.roles.resolve(guild.backendRoleId)))
  )
})

export const accessGuildAdministration = Bouncer.ability(
  async (user: { id: string }, guildId: string) => {
    const guild = await bot.getGuild(guildId)
    if (!guild) return false

    if (!guild.discordGuild) return false
    let member = guild.discordGuild.members.resolve(user.id)
    if (!member) {
      await guild.discordGuild.members.fetch()
      member = guild.discordGuild.members.resolve(user.id)
    }

    return (
      !!member &&
      (member.permissions.has(PermissionFlagsBits.Administrator) ||
        (guild.adminRoleId !== null && !!member.roles.resolve(guild.adminRoleId)))
    )
  }
)
