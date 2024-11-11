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

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export default class ApiClient {
    static instance: ApiClient
    private request: APIRequestContext
    private orders: Order[] = []
    private customerId: number | undefined
    private readonly baseAddress: string

    private constructor(request: APIRequestContext) {
        this.request = request
        this.baseAddress = baseURL
    }

    public static async getInstance(request: APIRequestContext): Promise<ApiClient> {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient(request)
        }
        return ApiClient.instance
    }

    public async createRandomCustomerObject(): Promise<number> {
        const response = await this.request.post(`${this.baseAddress}/${usersEndpoint}`)
        expect.soft(response.status()).toBe(StatusCodes.CREATED)
        const user = await response.json()
        this.customerId = user.id
        return this.customerId!
    }

    public async resetInstance(): Promise<void> {
        await this.deleteAllOrders()
        await this.deleteUserById()
    }

    private async deleteUserById(): Promise<void> {
        await this.request.delete(`${this.baseAddress}/${usersEndpoint}/${this.customerId}`)
    }

    private async deleteAllOrders(): Promise<void> {
       const ids = this.orders.map(o => o.orderId)

        for(let i = 0; i < ids.length; i++) await this.request.delete(`${this.baseAddress}/${ordersEndpoint}/order/${ids[i]}`)
    }

    private async createRandomOrderObject(): Promise<void> {
        const response = await this.request.post(`${this.baseAddress}/${ordersEndpoint}/new/${this.customerId}`)
        expect.soft(response.status()).toBe(StatusCodes.CREATED)

        const order = await response.json()
        this.orders.push(order)
    }

    private async getCustomersOrders(): Promise<Order[]> {
        const response = await this.request.get(`${this.baseAddress}/${ordersEndpoint}/all/${this.customerId}`)
        expect.soft(response.status()).toBe(StatusCodes.OK)
        return await response.json()
    }

    public async createOrdersOfAmount(amount: number): Promise<void> {
        for (let i = 0; i < amount; i++) {
            await this.createRandomOrderObject()
        }
        const actualOrders = await this.getCustomersOrders()
        const expectedOrders = this.orders

        expect.soft(actualOrders).toHaveLength(expectedOrders.length)
        expect.soft(actualOrders).toEqual(expectedOrders)
    }
}