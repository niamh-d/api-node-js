import { APIRequestContext } from 'playwright'
import { StatusCodes } from 'http-status-codes'
import { expect } from '@playwright/test'

const baseURL = 'http://localhost:3000'
const endpoint = 'users'

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export default class ApiClient {
    static instance: ApiClient
    private request: APIRequestContext
    private users: User[] = []
    private address: string

    private constructor(request: APIRequestContext) {
        this.request = request
        this.address = `${baseURL}/${endpoint}`
    }

    public static async getInstance(request: APIRequestContext): Promise<ApiClient> {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient(request)
        }
        return ApiClient.instance
    }

    public async deleteAllUsers(): Promise<void> {
       const ids = this.users.map(u => u.id)

        for(let i = 0; i < ids.length; i++) this.request.delete(`${this.address}/${ids[i]}`)
    }

    private async createRandomUserObject(): Promise<void> {
        const response = await this.request.post(this.address)
        expect.soft(response.status()).toBe(StatusCodes.CREATED)

        const user = await response.json()
        this.users.push(user)
    }

    public async createUsersOfAmount(amount: number) {
        for (let i = 0; i < amount; i++) {
            await this.createRandomUserObject()
        }
        const response = await this.request.get(this.address)
        expect.soft(response.status()).toBe(StatusCodes.OK)

        const actualUsers = await response.json()
        const expectedUsers = this.users

        expect.soft(actualUsers).toHaveLength(expectedUsers.length)
        expect.soft(actualUsers).toEqual(expectedUsers)
    }
}