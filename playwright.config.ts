import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/run-next/',
    use: {
        baseURL: 'http://localhost:3000/users',  // Adjust to your actual API base URL
    },
    workers: 1
});
