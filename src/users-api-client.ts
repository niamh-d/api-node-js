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

export default class UsersApiClient {
    static instance: UsersApiClient | undefined
    private request: APIRequestContext
    private listOfUsers: User[]
    private readonly address: string

    private constructor(request: APIRequestContext) {
        this.request = request
        this.address = `${baseURL}/${endpoint}`
        this.listOfUsers = []
    }

    // PRIVATE METHODS:

    private async getAllUsers(): Promise<User[]> {
        const response = await this.request.get(this.address)
        expect.soft(response.status()).toBe(StatusCodes.OK)
        return await response.json()
    }

    private async setListOfUsers(): Promise<void> {
        this.listOfUsers = await this.getAllUsers()
    }

    // create user object

    public async createNewUser(): Promise<number> {
        const response = await this.request.post(this.address)
        expect.soft(response.status()).toBe(StatusCodes.CREATED)
        const user = await response.json()
        this.listOfUsers.push(user)
        return user.id
    }

    // delete user

    private async deleteUserById(id: number): Promise<void> {
        const response = await this.request.delete(`${this.address}/${id}`)
        expect.soft(response.status()).toBe(StatusCodes.OK)
        this.listOfUsers = this.listOfUsers.filter(u => u.id !== id)
        await this.verifyListOfExistingUsers()
    }

    // validate number of orders and order objects

    private async verifyListOfExistingUsers(): Promise<void> {
        const actualUsers = await this.getAllUsers()
        const expectedUsers = this.listOfUsers

        expect.soft(actualUsers).toHaveLength(expectedUsers.length)
        expect.soft(actualUsers).toEqual(expectedUsers)
    }

    // close instance

    private closeInstance(): void {
        UsersApiClient.instance = undefined
    }

    // PUBLIC METHODS

    // creates OR returns an instance:

    public static async getInstance(request: APIRequestContext): Promise<UsersApiClient> {
        if (!UsersApiClient.instance) {
            UsersApiClient.instance = new UsersApiClient(request)
        }
        return UsersApiClient.instance
    }

    // resets = calls deletion of all orders for user and then deletes the user

    public async resetInstance(): Promise<void> {

        if(this.listOfUsers.length) await this.deleteAllUsers()
        this.closeInstance()
    }

    // creates N number of orders for instance's customer

    public async createUsersOfNumber(amount: number): Promise<void> {
        for (let i = 0; i < amount; i++) {
            await this.createNewUser()
        }
        await this.verifyListOfExistingUsers()
    }

    public async deleteAllUsers(): Promise<void> {
        await this.setListOfUsers()
        const allUserIds = this.listOfUsers.map(u => u.id)

        for(let i = 0; i < allUserIds.length; i++) {
            await this.deleteUserById(allUserIds[i])
        }
    }
}