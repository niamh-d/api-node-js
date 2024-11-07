import { test, expect } from '@playwright/test'
const baseURL: string = 'http://localhost:3000/users'

test.describe('User management API with loop', () => {
  test.beforeEach(async ({ request }) => {
    // get all users
    const response = await request.get(`${baseURL}`)
    const responseBody = await response.json()
    // get the number of objects in the array returned
    const numberOfObjects = responseBody.length

    // create an empty array to store all user ID
    const userIDs = []

    // loop through all users and store their ID in an array
    for (let i = 0; i < numberOfObjects; i++) {
      // get user ID from the response
      const userID = responseBody[i].id
      // push is used to add elements to the end of an array
      userIDs.push(userID)
    }

    // delete all users in a loop using previously created array
    for (let i = 0; i < numberOfObjects; i++) {
      // delete user by id
      const response = await request.delete(`${baseURL}/${userIDs[i]}`)
      // validate the response status code
      expect.soft(response.status()).toBe(200)
    }

    // verify that all users are deleted
    const responseAfterDelete = await request.get(`${baseURL}`)
    expect(responseAfterDelete.status()).toBe(200)
    const responseBodyEmpty = await responseAfterDelete.text()
    // validate that the response is an empty array
    expect(responseBodyEmpty).toBe('[]')
  })

  test('GET / - should return empty when no users', async ({ request }) => {
    const response = await request.get(`${baseURL}`)
    expect(response.status()).toBe(200)
    const responseBody = await response.text()
    expect(responseBody).toBe('[]')
  })

  test('Create few users and verify total number', async ({ request }) => {
    // loop through all users and store their ID in an array
    const numberOfObjects = 4

    for (let i = 0; i < numberOfObjects; i++) {
      await request.post(`${baseURL}`)
    }

    const response = await request.get(`${baseURL}`)
    const responseBody = await response.json()
    // get the number of objects in the array returned
    const actualNumObjects = responseBody.length

    expect.soft(actualNumObjects).toBe(numberOfObjects)
    expect.soft(responseBody).toHaveLength(numberOfObjects)
  })

  test('Create N users, delete all users and verify empty response', async ({ request }) => {
    const numberOfObjects = 4
    const userIds: number[] = []

    for (let i = 0; i < numberOfObjects; i++) {
      const response = await request.post(`${baseURL}`)
      const user = await response.json()
      userIds.push(user.id)
    }

    // delete all users in a loop using previously created array
    for (let i = 0; i < numberOfObjects; i++) {
      // delete user by id
      const response = await request.delete(`${baseURL}/${userIds[i]}`)
      // validate the response status code
      expect.soft(response.status()).toBe(200)
    }

    const responseAfterDelete = await request.get(`${baseURL}`)
    expect(responseAfterDelete.status()).toBe(200)
    const responseBodyEmpty = await responseAfterDelete.text()
    // validate that the response is an empty array
    expect(responseBodyEmpty).toBe('[]')
  })

  // deleting one user does not affect the other users
  test('Create N users, delete one user and verify existence of other users', async ({
    request,
  }) => {
    const numberOfObjects = 4
    const userIds: number[] = []

    for (let i = 0; i < numberOfObjects; i++) {
      const response = await request.post(`${baseURL}`)
      const user = await response.json()
      userIds.push(user.id)
    }

    await request.delete(`${baseURL}/${userIds[0]}`)

    const response = await request.get(`${baseURL}`)
    const responseBody = await response.json()
    const actualObjectLength = responseBody.length

    expect.soft(actualObjectLength).toBe(numberOfObjects - 1)
  })
})
