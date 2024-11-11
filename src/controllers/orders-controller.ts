import { Router, Request, Response } from 'express';
import { faker } from '@faker-js/faker';

const router = Router();

interface Order {
    orderId: number;
    customerId: number;
    orderCreateTime: string;
    orderStatus: string;
}

let orders: Order[] = [];

// log requests
router.use((req: Request, res: Response, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Get all orders
router.get('/', (req: Request, res: Response) => {
    console.log('Request received ...');
    console.log(`Fetching all orders`);
    res.json(orders);
});

// Get all orders for customer
router.get('/all/:customerId', (req: Request, res: Response) => {
    const id = +req.params.customerId
    console.log('Request received ...');
    console.log(`Fetching all orders for customer ${id}`);
    const customerOrders = orders.find(o => o.customerId === id)
    res.json(orders);
});

// Create a new order
router.post('/new/:customerId', (req: Request, res: Response) => {
    const id = +req.params.customerId
    console.log('Request received ...');
    const newOrder = {
        orderId: faker.number.int(100),
        customerId: id,
        orderStatus: "OPEN",
        orderCreateTime: new Date().toISOString()
    };
    orders.push(newOrder);

    console.log('Creating a new order', newOrder);
    res.status(201).json(newOrder);
});

// Get order by ID
router.get('/order/:orderId', (req: Request, res: Response) => {
    console.log('Request received ...');
    console.log(`Fetching user with ID: ${req.params.orderId}`);
    const order = orders.find(o => o.orderId === parseInt(req.params.orderId));

    if (order) {
        console.log(`Order with ID: ${req.params.orderId} found`, order);
        res.json(order);
    } else {
        console.log(`Order with ID: ${req.params.orderId} not found`);
        res.status(404).json({ message: 'Order not found' });
    }
});


// Delete order by ID
router.delete('/order/:orderId', (req: Request, res: Response) => {
    console.log('Request received ...');
    console.log('request params', req.params);
    console.log(`Deleting order with ID: ${req.params.id}`);
    const orderInd = orders.findIndex(o => o.orderId === parseInt(req.params.orderId));
    if (orderInd !== -1) {
        const deletedOrder = orders.splice(orderInd, 1);
        console.log(`Order with ID: ${req.params.orderId} deleted`);
        res.json(deletedOrder);
    } else {
        console.log(`Order with ID: ${req.params.orderId} not found`);
        res.status(404).json({ message: 'Order not found' });
    }
});

export default router;
