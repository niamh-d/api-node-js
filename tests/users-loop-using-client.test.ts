import { test } from '@playwright/test'
import ApiClient from '../src/api-client'

test.describe('Local server user tests using client', () => {
  let client: ApiClient

  test.beforeEach(async ({ request }) => {
    client = await ApiClient.getInstance(request)
    await client.deleteAllUsers()
  })

  test('Create N number of users and verify user object array and length of array', async () => {
    const numUsersToCreate = 4
    await client.createUsersOfAmount(numUsersToCreate)
  })
})
