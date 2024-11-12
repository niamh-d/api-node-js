import { test } from '@playwright/test'
import UsersApiClient from '../../src/users-api-client'

test.describe('Local server users tests using client', () => {
  let client: UsersApiClient
  let numUsersToCreate: number

  test.beforeEach(async ({ request }) => {
    client = await UsersApiClient.getInstance(request)
    await client.deleteAllUsers()
    numUsersToCreate = Math.floor(Math.random() * 10)
  })

  test.afterEach(async () => {
    await client.resetInstance()
  })

  test('Create N number of users and verify array of objects and length', async () => {
    await client.createUsersOfNumber(numUsersToCreate)
  })

  test('Delete all users', async () => {
    await client.deleteAllUsers()
  })
})
