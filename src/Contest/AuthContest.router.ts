import express = require('express')
import { server } from 'decentraland-server'

import { AuthRouter } from '../common'
import { readFile, listFiles, parseFileBody } from '../S3'
import { decrypt } from '../crypto'
import { ContestEntry } from './types'

export class AuthContestRouter extends AuthRouter {
  mount() {
    /**
     * Get all entries
     */
    this.router.get('/entries', server.handleRequest(this.getEntries))

    /**
     * Get entry by id
     */
    this.router.get('/entry/:projectId', server.handleRequest(this.getEntry))
  }

  async getEntries() {
    return listFiles()
  }

  async getEntry(req: express.Request): Promise<ContestEntry> {
    const projectId = server.extractFromReq(req, 'projectId')
    let entry: ContestEntry

    try {
      const file = await readFile(projectId)
      entry = parseFileBody(file)
    } catch (error) {
      throw new Error(`Unknown entry ${projectId}`)
    }

    entry.contest.email = await decrypt(entry.contest.email)

    if (entry.user) {
      entry.user.id = await decrypt(entry.user.id)
    }

    return entry
  }
}
