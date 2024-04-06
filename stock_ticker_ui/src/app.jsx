/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';

import { useReducer, useEffect, useMemo, useState } from 'react';

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

  const contextValue = useMemo(() => state, [state, dispatch]);

  return (
    <ThemeProvider>
      <WebSocketContext.Provider value={contextValue}>
        <Router />
      </WebSocketContext.Provider>
    </ThemeProvider>
  );
}
