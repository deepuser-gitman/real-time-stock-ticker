import socket from './stock_publisher.js';

const unsubscribe = async (symbol = "") => {
    socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': symbol }));
};

// sleep for 5 seconds and then unsubscribe and close the socket
setTimeout(() => {
    unsubscribe('AAPL');
    unsubscribe('BINANCE:BTCUSDT');
    unsubscribe('IC MARKETS:1');
    socket.close();
}, 2000);
