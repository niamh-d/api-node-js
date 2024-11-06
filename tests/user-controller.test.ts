// tests/api.spec.ts
import { test, expect } from '@playwright/test';
let baseURL: string = 'http://localhost:3000/users';

test.describe('User management API', () => {

    let existingUserId: number

    test('POST / - should add a new user', async ({ request }) => {
        const response = await request.post(`${baseURL}`);
        expect.soft(response.status()).toBe(201);
        const returnedUser = await response.json()
        existingUserId = returnedUser.id

        const usersResponse = await request.get(`${baseURL}`);
        const users = await usersResponse.json()

        const user = users.find((user: { id: number; }) => user.id === existingUserId)
        expect.soft(user).toEqual(returnedUser)
    });

    test('GET /:id - should return a user by ID', async ({ request }) => {
        const response = await request.get(`${baseURL}/${existingUserId}`);
        expect.soft(response.status()).toBe(200);
        const responseBody = await response.json()
        expect.soft(responseBody.id).toBe(existingUserId);
    });

    test('GET /:id - should return 404 if user not found', async ({ request }) => {
        const id = 50
        const response = await request.get(`${baseURL}/${id}`);
        expect.soft(response.status()).toBe(404);
    });

    test('DELETE /:id - should delete a user by ID', async ({ request }) => {

        const firstGetResponse = await request.get(`${baseURL}/${existingUserId}`);
        expect.soft(firstGetResponse.status()).toBe(200);
        await request.delete(`${baseURL}/${existingUserId}`);
        const secondGetResponse = await request.get(`${baseURL}/${existingUserId}`);
        expect.soft(secondGetResponse.status()).toBe(404);
    });

    test('DELETE /:id - should return 404 if user not found', async ({ request }) => {
        const response = await request.delete(`${baseURL}/${existingUserId}`);
        expect.soft(response .status()).toBe(404);
    });
});
