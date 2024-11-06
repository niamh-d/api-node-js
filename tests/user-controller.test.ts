// tests/api.spec.ts
import { test, expect } from '@playwright/test';
import {StatusCodes} from "http-status-codes";
let baseURL: string = 'http://localhost:3000/users';

type User = {
    id: number,
    name: string,
    phone: string,
    email: string
}

test.describe('User management API', () => {

    let createdUserId: number
    let deletedUserId: number
    let createdUser: User
    const nonExistingUserId = 1000

    test('POST / - should add a new user', async ({ request }) => {
        const response = await request.post(`${baseURL}`);
        expect.soft(response.status()).toBe(StatusCodes.CREATED);

        createdUser = await response.json()
        createdUserId = createdUser.id


        const usersResponse = await request.get(`${baseURL}`);
        const users: User[] = await usersResponse.json()

        const user = users.find((user: User) => user.id === createdUserId)
        expect.soft(user).toEqual(createdUser)
    });

    test('GET /:id - should return a user by ID', async ({ request }) => {
        const response = await request.get(`${baseURL}/${createdUserId}`);
        expect.soft(response.status()).toBe(StatusCodes.OK);
        const responseBody = await response.json()
        expect.soft(responseBody.id).toBe(createdUserId);
    });

    test('GET /:id - should return 404 if user not found', async ({ request }) => {
        const response = await request.get(`${baseURL}/${nonExistingUserId}`);
        expect.soft(response.status()).toBe(StatusCodes.NOT_FOUND);
    });

    test('DELETE /:id - should delete a user by ID', async ({ request }) => {

        const firstGetResponse = await request.get(`${baseURL}/${createdUserId}`);
        expect.soft(firstGetResponse.status()).toBe(StatusCodes.OK);

        await request.delete(`${baseURL}/${createdUserId}`);
        deletedUserId = createdUserId

        const secondGetResponse = await request.get(`${baseURL}/${deletedUserId}`);
        expect.soft(secondGetResponse.status()).toBe(StatusCodes.NOT_FOUND);
    });

    test('DELETE /:id - should return 404 if user not found', async ({ request }) => {
        const response = await request.delete(`${baseURL}/${deletedUserId}`);
        expect.soft(response .status()).toBe(StatusCodes.NOT_FOUND);
    });
});
