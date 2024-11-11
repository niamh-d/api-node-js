import { APIRequestContext } from 'playwright'
import { StatusCodes } from 'http-status-codes'
import { expect } from '@playwright/test'

const baseURL = 'http://localhost:3000'
const ordersEndpoint = 'orders'
const usersEndpoint = 'users'

interface Order {
    orderId: number;
    customerId: number;
    orderCreateTime: string;
    orderStatus: string;
}

export default class ApiClient {
    static instance: ApiClient | undefined
    private request: APIRequestContext
    private orders: Order[] = []
    private customerId: number | undefined
    private readonly baseAddress: string

    private constructor(request: APIRequestContext) {
        this.request = request
        this.baseAddress = baseURL
    }

    // PRIVATE METHODS:

    // get:

    private async getCustomersOrders(): Promise<Order[]> {
        const response = await this.request.get(`${this.baseAddress}/${ordersEndpoint}/all/${this.customerId}`)
        expect.soft(response.status()).toBe(StatusCodes.OK)
        return await response.json()
    }

    // create:

    public async createRandomCustomerObject(): Promise<number> {
        const response = await this.request.post(`${this.baseAddress}/${usersEndpoint}`)
        expect.soft(response.status()).toBe(StatusCodes.CREATED)
        const user = await response.json()
        this.customerId = user.id
        return this.customerId!
    }

    private async createRandomOrderObject(): Promise<void> {
        const response = await this.request.post(`${this.baseAddress}/${ordersEndpoint}/new/${this.customerId}`)
        expect.soft(response.status()).toBe(StatusCodes.CREATED)
        const order = await response.json()
        this.orders.push(order)
    }

    // delete:

    private async deleteUserById(): Promise<void> {
        const response = await this.request.delete(`${this.baseAddress}/${usersEndpoint}/${this.customerId}`)
        expect.soft(response.status()).toBe(StatusCodes.OK)
        this.customerId = undefined
    }

    // validate number of orders and order objects

    private async verifyOrders(): Promise<void> {
        const actualOrders = await this.getCustomersOrders()
        const expectedOrders = this.orders

        expect.soft(actualOrders).toHaveLength(expectedOrders.length)
        expect.soft(actualOrders).toEqual(expectedOrders)
    }

    // close instance

    private closeInstance(): void {
        ApiClient.instance = undefined
    }

    // PUBLIC METHODS

    // creates OR returns an instance:

    public static async getInstance(request: APIRequestContext): Promise<ApiClient> {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient(request)
        }
        return ApiClient.instance
    }

    // resets = calls deletion of all orders for user and then deletes the user

    public async resetInstance(): Promise<void> {
        if(this.orders.length) await this.deleteAllOrders()
        if(this.customerId) await this.deleteUserById()
        this.closeInstance()
    }

    // creates N number of orders for instance's customer

    public async createOrdersOfAmount(amount: number): Promise<void> {
        for (let i = 0; i < amount; i++) {
            await this.createRandomOrderObject()
        }
        await this.verifyOrders()
    }

    // deletes all orders for instance's customer

    public async deleteAllOrders(): Promise<void> {
        const ids = this.orders.map(o => o.orderId)

        for(let i = 0; i < ids.length; i++) {
            await this.request.delete(`${this.baseAddress}/${ordersEndpoint}/order/${ids[i]}`)
        }

        this.orders = []

        await this.verifyOrders()
    }
}