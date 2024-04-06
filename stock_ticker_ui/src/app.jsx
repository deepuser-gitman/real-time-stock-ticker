/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';

import { useReducer, useEffect, useMemo, useState } from 'react';
// import useWebSocket from 'react-use-websocket';

import { WebSocketContext } from 'src/contexts/webSocketContext';
import webSocketReducer from './reducers/webSocketReducer';
import { socket } from './utils/socket';

export default function App() {
  useScrollToTop();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [stockList, setStockList] = useState([]);
  const [state, dispatch] = useReducer(webSocketReducer, { watchlist: [], stock_list: stockList });
  console.log(`Current time: ${new Date()}`);
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      socket.emit("message", "BINANCE:BTCUSDT")
      socket.emit("message", "COINBASE:ETH-USD")
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      console.log(value);
      setStockList(previous => [...previous, value]);
      console.log(stockList.length);
      dispatch({ type: 'ADD_STOCK', payload: JSON.parse(value) });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onFooEvent);
    };
  }, []);

  // const [state, dispatch] = useReducer(webSocketReducer, { watchlist: [], stock_list: stockList });

  const contextValue = useMemo(() => state, [state, dispatch]);

  // useEffect(() => {
  // socket.onopen = () => {
  //   console.log('WebSocket connected!');
  //   dispatch({ type: 'ADD_WATCHLIST', payload: 'COINBASE:ETH-USD' });
  // };

  // socket.onclose = () => {
  //   console.log('WebSocket closed!');
  // };

  // socket.onerror = (error) => {
  //   console.error('WebSocket error:', error);
  // };

  // socket.onMessage = (data) => {
  //   dispatch({ type: 'ADD_STOCK', payload: data });
  // };

  // dispatch({ type: 'ADD_WATCHLIST', payload: 'COINBASE:ETH-USD' });
  // dispatch({ type: 'ADD_WATCHLIST', payload: 'BINANCE:BTCUSDT' });
  // }, [socket]);

  return (
    <ThemeProvider>
      {/* <WebSocketContext.Provider value={contextValue}> */}
      <WebSocketContext.Provider value={contextValue}>
        {/* <WebSocketContext.Provider> */}
        <Router />
      </WebSocketContext.Provider>
    </ThemeProvider>
  );
}
