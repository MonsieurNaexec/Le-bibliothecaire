import env from '#start/env'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { exec as primitiveExec } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { inc, major, minor, patch, type ReleaseType } from 'semver'
import pkg from '../package.json' with { type: 'json' }

const exec = promisify(primitiveExec)

export default class Deploy extends BaseCommand {
  static commandName = 'deploy'
  static description = 'Deploy the docker image to registry'

  static options: CommandOptions = {}

  private dockerImage?: string
  private remoteRegistry = ''

  private releaseType?: ReleaseType
  private prereleaseIdentifier?: string
  private mergeNext = false
  private mergeLatest = false
  private mergePrereleaseGlobal = false
  private prereleaseGlobal?: string
  private mergeRoot = false
  private newVersion: string | null = null

  private tags: string[] = []

  async interact() {
    const currentVersion = pkg.version
    this.dockerImage = pkg.name

    this.logger.info('Deploying the docker image to the registry')
    this.logger.info(`Current version: ${this.colors.yellow(currentVersion)}`)

    this.remoteRegistry = await this.prompt.ask('Remote registry', {
      default: env.get('DEPLOY_REGISTRY'),
    })

    const releaseType = await this.prompt.choice('Select release type', [
      { name: 'major', message: `Major (${inc(currentVersion, 'major')})` },
      { name: 'minor', message: `Minor (${inc(currentVersion, 'minor')})` },
      { name: 'patch', message: `Patch (${inc(currentVersion, 'patch')})` },
      { name: 'beta', message: `Beta (${inc(currentVersion, 'prerelease', 'beta')})` },
      { name: 'alpha', message: `Alpha (${inc(currentVersion, 'prerelease', 'alpha')})` },
      { name: 'keep', message: `Keep current version (${currentVersion})` },
    ])

    if (releaseType === 'beta' || releaseType === 'alpha') {
      this.prereleaseIdentifier = releaseType
      this.releaseType = 'prerelease'
    } else {
      this.releaseType = releaseType as ReleaseType
    }

    this.newVersion =
      releaseType === 'keep'
        ? currentVersion
        : inc(currentVersion, this.releaseType, this.prereleaseIdentifier)
    if (!this.newVersion) {
      throw new Error('New calculated version is invalid')
    }

    this.mergeRoot = await this.prompt.confirm(
      `Update the ${this.colors.gray(this.dockerImage)} tag to this image?`,
      {
        default: true,
      }
    )
    this.mergeLatest = await this.prompt.confirm(
      `Update the ${this.colors.gray(`${this.dockerImage}:latest`)} tag to this image?`,
      {
        default: this.releaseType !== 'prerelease',
      }
    )
    this.mergeNext = await this.prompt.confirm(
      `Update the ${this.colors.gray(`${this.dockerImage}:next`)} tag to this image?`,
      {
        default: this.releaseType === 'prerelease',
      }
    )
    this.prereleaseGlobal = `${this.dockerImage}:${major(this.newVersion)}.${minor(this.newVersion)}.${patch(this.newVersion)}-${this.prereleaseIdentifier}`
    if (this.releaseType === 'prerelease') {
      this.mergePrereleaseGlobal = await this.prompt.confirm(
        `Update the ${this.colors.gray(this.prereleaseGlobal)} tag to this image?`,
        {
          default: true,
        }
      )
    }

    // Create tags list
    this.tags.push(`${this.dockerImage}:${this.newVersion}`)
    if (this.mergeRoot) this.tags.push(`${this.dockerImage}`)
    if (this.mergePrereleaseGlobal) this.tags.push(this.prereleaseGlobal)
    if (this.mergeNext) this.tags.push(`${this.dockerImage}:next`)
    if (this.mergeLatest) this.tags.push(`${this.dockerImage}:latest`)
  }

  async run() {
    const pushCommands = this.ui.tasks()
    if (this.newVersion)
      pushCommands.add(`Updating package.json version to ${this.newVersion}`, async () => {
        if (!this.newVersion) throw new Error('New version is not set')
        pkg.version = this.newVersion
        await writeFile(new URL('../package.json', import.meta.url), JSON.stringify(pkg, null, 2))
        return 'Package version updated'
      })
    const buildCommand = `docker build ${this.tags.map((t) => `-t ${t}`).join(' ')} .`
    pushCommands.add(
      `Building the docker image ${this.colors.gray(`(${buildCommand})`)}`,
      async () => {
        await exec(buildCommand)
        return 'Image built'
      }
    )
    if (this.remoteRegistry) {
      for (const tag of this.tags) {
        pushCommands.add(`Pushing the docker image ${this.colors.gray(tag)}`, async (task) => {
          task.update(`Adding remote tag ${this.remoteRegistry}/${tag}`)
          await exec(`docker tag ${tag} ${this.remoteRegistry}/${tag}`)
          task.update(`Pushing the image to the registry`)
          await exec(`docker push ${this.remoteRegistry}/${tag}`)
          return 'Tag pushed successfully'
        })
      }
    }
    pushCommands.run()
  }
}
