import { expect, test } from '@playwright/test'
import ApiClient from '../../src/api-client'

test.describe('Local server order tests using client', () => {
  let client: ApiClient
  let customerId: number
  let numOrdersToCreate: number

  test.beforeEach(async ({ request }) => {
    client = await ApiClient.getInstance(request)
    customerId = await client.createRandomCustomerObject()
    expect.soft(customerId).toBeDefined()
    numOrdersToCreate = Math.floor(Math.random() * 10)
  })

  test.afterEach(async () => {
    await client.resetInstance()
  })

  test('Create N orders for user and verify order object array and length of array', async () => {
    await client.createOrdersOfAmount(numOrdersToCreate)
  })

  test('Delete all orders for user', async () => {
    await client.deleteAllOrders()
  })
})
