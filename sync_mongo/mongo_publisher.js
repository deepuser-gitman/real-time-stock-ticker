import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import mongoose from 'mongoose';
import redis from 'redis';
import Stock from './models/stock.js';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// connect to mongodb & listen for requests
const dbURI = process.env.DB_URI;
mongoose.connect(dbURI)

const redis_connection_config = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
}
const redisClient = redis.createClient(
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

const kafka = new Kafka({
    clientId: 'kafka-stock',
    brokers: ['localhost:9094', 'kafka:9092'],
});

const consumer = kafka.consumer({
    groupId: 'stock-group', retry: {
        retries: 10,
        factor: 3,
        initialRetryTime: 5000,
        maxRetryTime: 25000
    }
})

await consumer.connect()
await consumer.subscribe({ topic: 'stock', fromBeginning: true })

await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        console.log(`Message from kafka: ${message.value}`)
        const message_json = JSON.parse(message.value.toString())
        const message_data = message_json['data']
        message_data.forEach(async element => {
            const stock_data = {
                symbol: element['s'],
                price: element['p'],
                time: element['t'],
                volume: element['v']
            }
            redisClient.publish(element['s'], JSON.stringify(stock_data)).then(result => {
                console.log(result);
            }).catch(err => {
                console.log(err);
            });
            const stock = new Stock(stock_data);
            await stock.save()
                .then(result => {
                    console.log(result);
                })
                .catch(err => {
                    console.log(err);
                });
        });
    },
});
