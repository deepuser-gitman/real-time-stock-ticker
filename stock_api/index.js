import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import express from 'express';
import { Server as SocketServer } from "socket.io";
import { createServer } from 'http';
import stockRoutes from './routes/stockRoutes.js';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// connect to mongodb & listen for requests
const dbURI = process.env.DB_URI;
mongoose.connect(dbURI)

const app = express();

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
    // allowEIO3: true,
    // path: '/socket.io',
    // serveClient: true,
    // transports: ['websocket'],
    // cookie: false,
    cors: {
        origin: '*',
    }
});

let connectedClients = {}; // Map to store connected clients and their associated stock symbols

io.on('error', (err) => {
    console.log(err);
})

io.on('close', () => {
    console.log('Server closed');
})

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('message', async (socket_message) => {
        console.log(`Message from client ${socket.id}: ${socket_message}`)

        await socket.join(socket_message);
        console.log(`Socket ${socket.id} joined rooms:`, Array.from(socket.rooms).join(', '));
        if (!connectedClients[socket_message]) {
            connectedClients[socket_message] = [socket.id];
        }
        else {
            connectedClients[socket_message].push(socket.id);
        }
        redisClient.subscribe(socket_message, async (message) => {
            console.log(`Message from redis: ${message}`)

            io.to(socket_message).fetchSockets().then(sockets => {
                sockets.forEach(async io_socket => {
                    console.log(`A message to Socket ID ${io_socket.id}: ${message}`);
                    io_socket.emit('message', message);
                });
            });
        }).then(result => {
            console.log(`Result: ${result}`);
        }).catch(err => {
            console.log(`Error: ${err}`);
        });
    });
    socket.on('disconnect', async () => {
        console.log(`Client disconnected: ${socket.id}`);
        for (const [symbol, clients] of Object.entries(connectedClients)) {
            if (clients.includes(socket.id)) {
                connectedClients[symbol] = connectedClients[symbol].filter(client => client !== socket.id);
                if (connectedClients[symbol].length === 0) {
                    delete connectedClients[symbol];
                    await redisClient.unsubscribe(symbol);
                    console.log(`Unsubscribed from ${symbol}`);
                }
            }
        }
    });
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
