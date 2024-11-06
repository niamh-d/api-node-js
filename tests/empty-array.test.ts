import { test, expect } from '@playwright/test';
let baseURL: string = 'http://localhost:3000/users';

test.describe('User management API', () => {

    test('GET / - should return empty when no users', async ({ request }) => {
        const response = await request.get(`${baseURL}`);
        expect(response.status()).toBe(200);
        const responseBody = await response.text()
        expect(responseBody).toBe('[]');
    });
});