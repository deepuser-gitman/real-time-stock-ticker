import { Socket, Server as SocketServer } from "socket.io";
import { createClient } from 'redis';

/**
 * Handles actions when a client socket sends a message
 * 
 * @param {Socket} socket - The client socket
 * @param {object} connectedClients - Object containing connected clients
 * @param {createClient} redisClient - The Redis client
 * @param {SocketServer} io - The socket.io server
 */
export default async function handleMessage(socket, connectedClients, redisClient, io) {
    socket.on('message', async (socket_message) => {
        console.log(`Message from client ${socket.id}: ${socket_message}`);

        await socket.join(socket_message);
        console.log(`Socket ${socket.id} joined rooms:`, Array.from(socket.rooms).join(', '));

        if (!connectedClients[socket_message]) {
            connectedClients[socket_message] = [socket.id];
        } else {
            connectedClients[socket_message].push(socket.id);
        }

        redisClient.subscribe(socket_message, async (message) => {
            console.log(`Message from redis: ${message}`);

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
}

