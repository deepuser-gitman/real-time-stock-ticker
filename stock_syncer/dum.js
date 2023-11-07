const { Kafka } = require('kafkajs');

// Define the Kafka broker's connection information
const kafka = new Kafka({
    clientId: 'my-nodejs-client',
    brokers: ['localhost:9092'], // Use the Kafka container's host and port
});

// Create a Kafka producer
const producer = kafka.producer();

// Define the topic to which you want to send messages
const topic = 'my-topic';

async function run() {
    // Connect to the Kafka broker
    await producer.connect();

    // Send a sample message to the Kafka topic
    await producer.send({
        topic,
        messages: [
            {
                value: 'Hello, Kafka!',
            },
        ],
    });

    // Close the producer when done
    await producer.disconnect();
}

run().catch((error) => {
    console.error(`Error in Kafka producer: ${error}`);
});
