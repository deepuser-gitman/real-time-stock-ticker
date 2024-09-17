import dotenv from 'dotenv';
import redis from 'redis';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}


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

while (true) {
    // randomly generate stock data
    const random_element = (0.75 + Math.random() * 0.5)
    const stock_data = {
        "symbol": random_element >= 0.95 ? "BINANCE:BTCUSDT" : "COINBASE:ETH-USD",
        "price": 4323.09 * random_element,
        "time": Date.now(),
        "volume": 1163 * random_element,
    }
    redisClient.publish(stock_data['symbol'], JSON.stringify(stock_data)).then(result => {
        console.log(`Message published to redis: ${JSON.stringify(result)}`);
    }).catch(err => {
        console.log(err);
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
}
