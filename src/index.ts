import express from 'express';
import userController from "./controllers/user-controller";
import ordersController from "./controllers/orders-controller";

const app = express();
const port = 3000;

app.use(express.json());

// Use controllers
app.use('/users', userController);
app.use('/orders', ordersController);

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
});
