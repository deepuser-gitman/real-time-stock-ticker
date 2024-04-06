// Import required modules
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from "socket.io";

// Create an Express app
const app = express();

// Create an HTTP server using the Express app
const server = createServer(app);

// Create a Socket.io server by passing the HTTP server
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

io.on('error', (err) => {
    console.log(err);
})

io.on('close', () => {
    console.log('Server closed');
})


// Event listener for new socket connections
io.on('connection', async (socket) => {
    console.log(`Client connected: ${socket.id}`);
    io.emit('message', 'hi1');
    socket.broadcast.emit('message', 'hi1');
    io.emit('message', 'hi2');
    // Event listener for receiving messages from the client
    socket.on('message', (message) => {
        console.log(`Message from client ${socket.id}: ${message}`);

        // Broadcast the received message to all connected clients
        io.emit('message', message);
    });

    // Event listener for handling disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

server.on('error', (err) => {
    console.log(err);
})


// Start the server and listen on a specific port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// What is the URL for this web socket server?
// http://localhost:3000
// do I have to add ws://
// do I have to add /socket.io


// import express from 'express';
// const app = express();
// import http from 'http';
// const server = http.createServer(app);
// import { Server } from "socket.io";
// const io = new Server(server, {
//     cors: {
//         origin: '*',
//     },
//     allowEIO3: true,
//     // path: '/socket.io',
//     serveClient: true,
//     transports: ['websocket'],
// });

// app.get('/', (req, res) => {
//     console.log('test connected');
//     res.send('test');
// });

// io.on('connection', (socket) => {
//     console.log('a user connected');
//     socket.broadcast.emit('hi');
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });
//     socket.on('message', (msg) => {
//         console.log('message: ' + msg);
//     });
// });

// server.listen(4000, () => {
//     console.log('listening on *:4000');
// });