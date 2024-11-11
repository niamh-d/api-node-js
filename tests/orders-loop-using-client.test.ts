import { expect, test } from '@playwright/test'
import ApiClient from '../src/api-client'

test.describe('Local server order tests using client', () => {
  let client: ApiClient
  let customerId: number

  test.beforeEach(async ({ request }) => {
    client = await ApiClient.getInstance(request)
    customerId = await client.createRandomCustomerObject()
    expect.soft(customerId).toBeDefined()
  })

  test.afterEach(async ({ request }) => {
    client = await ApiClient.getInstance(request)
    await client.resetInstance()
  })

  test('Create N orders for user and verify order object array and length of array', async () => {
    const numOrdersToCreate = 4
    await client.createOrdersOfAmount(numOrdersToCreate)
  })
})
