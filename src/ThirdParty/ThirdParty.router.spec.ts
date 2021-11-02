import supertest from 'supertest'
import { createAuthHeaders, buildURL } from '../../spec/utils'
import {
  ThirdPartyFragment,
  ThirdPartyMetadataType,
} from '../ethereum/api/fragments'
import { thirdPartyAPI } from '../ethereum/api/thirdParty'
import { app } from '../server'
import { ThirdParty } from './ThirdParty.types'
import { toThirdParty } from './utils'

const server = supertest(app.getApp())

jest.mock('../ethereum/api/thirdParty')

describe('ThirdParty router', () => {
  let fragments: ThirdPartyFragment[]
  let thirdParties: ThirdParty[]

  beforeEach(() => {
    let metadata = {
      type: ThirdPartyMetadataType.THIRD_PARTY_V1,
      thirdParty: { name: 'a name', description: 'a description' },
    }
    fragments = [
      { id: '1', managers: ['0x1'], maxItems: 3, totalItems: 2, metadata },
      {
        id: '2',
        managers: ['0x2', '0x3'],
        maxItems: 2,
        totalItems: 1,
        metadata,
      },
    ]
    thirdParties = fragments.map(toThirdParty)
  })

  describe('when retreiving all third party records', () => {
    let url: string

    beforeEach(() => {
      ;(thirdPartyAPI.fetchThirdParties as jest.Mock).mockResolvedValueOnce(
        fragments
      )
      url = '/thirdParties'
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should respond with a third party array', () => {
      return server
        .get(buildURL(url))
        .set(createAuthHeaders('get', url))
        .expect(200)
        .then((response: any) => {
          expect(response.body).toEqual({ data: thirdParties, ok: true })
        })
    })
  })

  describe('when using a query string to filter', () => {
    let url: string
    let manager: string
    let managerFragments: ThirdPartyFragment[]
    let managerThirdParties: ThirdParty[]

    beforeEach(() => {
      manager = '0x1'
      managerFragments = fragments.slice(0, 1)
      ;(thirdPartyAPI.fetchThirdParties as jest.Mock).mockResolvedValueOnce(
        managerFragments
      )
      managerThirdParties = managerFragments.map(toThirdParty)
      url = '/thirdParties'
    })

    it('should return the third parties for a particular manager', () => {
      const queryString = { manager }
      return server
        .get(buildURL(url, queryString))
        .set(createAuthHeaders('get', url))
        .expect(200)
        .then((response: any) => {
          expect(response.body).toEqual({
            data: managerThirdParties,
            ok: true,
          })
          expect(thirdPartyAPI.fetchThirdParties).toHaveBeenCalledWith(manager)
        })
    })
  })
})