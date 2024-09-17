import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import express from 'express';
import { Server as SocketServer } from "socket.io";
import { createServer } from 'http';
import stockRoutes from './routes/stockRoutes.js';
import onConnect from './streaming/onConnect.js';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// connect to mongodb & listen for requests
const dbURI = process.env.DB_URI;
mongoose.connect(dbURI)

const app = express();

app.set('connectedClients', {});

// stock routes
app.use('/stocks', stockRoutes);

const server = createServer(app);

const redis_connection_config = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
}
const redisClient = createClient(
    {
        socket: redis_connection_config,
        password: process.env.REDIS_PASS,
        retry_strategy: () => 1000
    },
);

await redisClient.connect();

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Error:', err);
});

app.get('/', (req, res) => {
    res.send('alive');
});

const io = new SocketServer(server, {
    cors: {
        origin: '*',
    }
});

io.on('error', (err) => {
    console.log(err);
})

io.on('close', () => {
    console.log('Server closed');
})

io.on('connection', (socket) => {
    onConnect(app, io, socket, redisClient);
});

server.on('error', (err) => {
    console.log(err);
})

server.on('close', () => {
    console.log('Server closed');
})

// server.on('connection', (socket) => {
//     console.log('Server connected');
//     // console.log(socket);
// })

server.listen(3000, () => {
    console.log('Server started on port 3000');
});
