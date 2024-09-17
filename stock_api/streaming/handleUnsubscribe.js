import { Socket } from "socket.io";
import { createClient } from 'redis';
/**
 * Handles the unsubscribe event for a socket connection.
 * Removes the socket from the list of connected clients for a specific message.
 * If there are no more clients subscribed to the message, it unsubscribes from Redis.
 * @param {Socket} socket - The socket connection
 * @param {Object} connectedClients - Object containing arrays of connected clients for each message
 * @param {createClient} redisClient - The Redis client
 */
export default async function handleUnsubscribe(socket, connectedClients, redisClient) {
    socket.on('unsubscribe', async (socket_message) => {
        console.log(`Client ${socket.id} unsubscribed from ${socket_message}`);

        // Remove the socket from the list of connected clients for the specific message
        connectedClients[socket_message] = connectedClients[socket_message].filter(client => client !== socket.id);

        // If there are no more clients subscribed to the message
        if (connectedClients[socket_message].length === 0) {
            // Remove the message from the connected clients
            delete connectedClients[socket_message];

            // Unsubscribe from Redis for the message
            await redisClient.unsubscribe(socket_message);
            console.log(`Unsubscribed from ${socket_message}`);
        }
    });
}

