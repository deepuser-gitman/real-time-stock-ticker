import WebSocket from 'ws';
import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';

dotenv.config();

const kafka = new Kafka({
    clientId: 'kafka-nodejs-starter',
    brokers: ['localhost:9094', 'kafka:9092'],
});

const producer = kafka.producer({
    allowAutoTopicCreation: true,
    retry: {
        retries: 10,
        factor: 2,
        initialRetryTime: 5000,
        maxRetryTime: 15000
    }
});

await producer.connect();

const socket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`);

// Connection opened -> Subscribe
socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'AAPL' }))
    socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'BINANCE:BTCUSDT' }))
    socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'IC MARKETS:1' }))
});

const send_message_to_kafka = async (event) => {
    const message = event.data;
    console.log('Message from server ', message);

    await producer.send({
        topic: 'stock',
        messages: [{ value: message }],
    });
};

// Listen for messages
socket.addEventListener('message', send_message_to_kafka);

export default socket;