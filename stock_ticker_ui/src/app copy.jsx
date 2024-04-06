/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';

import { useReducer, useEffect, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import { WebSocketContext } from 'src/contexts/webSocketContext';
import webSocketReducer from './reducers/webSocketReducer';

export default function App() {
  useScrollToTop();
  // const socket = useWebSocket('wss://localhost:3000');
  // const socket = useWebSocket('wss://socketsbay.com/wss/v2/2/demo/', {
  const socket = useWebSocket('ws://localhost:3000/socket.io/?transport=websocket', {
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    onOpen: () => {
      console.log('WebSocket opened!');
    },
    onMessage: (data) => {
      console.log('WebSocket message:', data);
    },
    reconnectAttempts: 5,
    reconnectInterval: 500
  });
  console.log(`Current time: ${new Date()}`);

  const [state, dispatch] = useReducer(webSocketReducer, { watchlist: [], stock_list: [], socket });

  const contextValue = useMemo(() => [state, dispatch], [state, dispatch]);

  useEffect(() => {
    socket.onopen = () => {
      console.log('WebSocket connected!');
      dispatch({ type: 'ADD_WATCHLIST', payload: 'COINBASE:ETH-USD' });
    };

    socket.onclose = () => {
      console.log('WebSocket closed!');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onMessage = (data) => {
      dispatch({ type: 'ADD_STOCK', payload: data });
    };

    // dispatch({ type: 'ADD_WATCHLIST', payload: 'COINBASE:ETH-USD' });
    // dispatch({ type: 'ADD_WATCHLIST', payload: 'BINANCE:BTCUSDT' });
  }, [socket]);

  return (
    <ThemeProvider>
      <WebSocketContext.Provider value={contextValue}>
        <Router />
      </WebSocketContext.Provider>
    </ThemeProvider>
  );
}
