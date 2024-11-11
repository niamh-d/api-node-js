import { test, expect } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
const baseURL: string = 'http://localhost:3000/users'

test.describe('User management API', () => {
  test('GET / - should return empty when no users', async ({ request }) => {
    const response = await request.get(`${baseURL}`)
    expect(response.status()).toBe(StatusCodes.OK)
    const responseBody = await response.text()
    expect(responseBody).toBe('[]')
  })
})
