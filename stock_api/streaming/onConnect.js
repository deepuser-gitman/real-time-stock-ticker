import express from 'express';
import { Socket, Server as SocketServer } from "socket.io";
import { createClient } from 'redis';
import handleMessage from './handleMessage.js';
import handleDisconnect from './handleDisconnect.js';
import handleUnsubscribe from './handleUnsubscribe.js';

/**
 * Function to handle actions when a client socket connects.
 *
 * @param {express} app - The main application object
 * @param {SocketServer} io - The socket.io server object
 * @param {Socket} socket - The client socket object
 * @param {createClient} redisClient - The Redis client object
 * @return {Promise<void>} This function does not return anything synchronously
 */
export default async function onConnect(app, io, socket, redisClient) {
    const connectedClients = app.get('connectedClients');
    console.log(`Client connected: ${socket.id}`);

    try {
        await handleMessage(socket, connectedClients, redisClient, io);
        await handleDisconnect(socket, connectedClients, redisClient);
        await handleUnsubscribe(socket, connectedClients, redisClient);
    } catch (error) {
        console.error(`Error handling client connection: ${error.message}`);
    }
}
