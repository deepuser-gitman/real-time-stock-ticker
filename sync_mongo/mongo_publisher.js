import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import mongoose from 'mongoose';
import Stock from './models/stock.js';

dotenv.config();

// connect to mongodb & listen for requests
const dbURI = process.env.DB_URI;

console.log(`DB URI: ${dbURI}`);

mongoose.connect(dbURI)

const kafka = new Kafka({
    clientId: 'kafka-stock',
    brokers: ['localhost:9094', 'kafka:9092'],
});

const consumer = kafka.consumer({
    groupId: 'stock-group', retry: {
        retries: 10,
        factor: 2,
        initialRetryTime: 5000,
        maxRetryTime: 15000
    }
})

await consumer.connect()
await consumer.subscribe({ topic: 'stock', fromBeginning: true })

await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        console.log(`Message from kafka: ${message.value}`)
        const message_json = JSON.parse(message.value.toString())
        const message_data = message_json['data']
        message_data.forEach(element => {
            const stock_data = {
                symbol: element['s'],
                price: element['p'],
                time: element['t'],
                volume: element['v']
            }
            const stock = new Stock(stock_data);
            stock.save()
                .then(result => {
                    console.log(result);
                })
                .catch(err => {
                    console.log(err);
                });
        });
    },
});
