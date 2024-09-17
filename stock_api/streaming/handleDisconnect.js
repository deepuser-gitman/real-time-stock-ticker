import { Socket } from "socket.io";
import { createClient } from 'redis';


// Function to handle actions when a client socket disconnects
/**
 * Handles the disconnection of a client socket by unsubscribing from Redis channels and updating the list of connected clients.
 * @param {Socket} socket - The client socket that disconnected.
 * @param {object} connectedClients - Object containing symbols as keys and an array of client IDs as values.
 * @param {createClient} redisClient - The Redis client instance.
 */
export default async function handleDisconnect(socket, connectedClients, redisClient) {
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
}
