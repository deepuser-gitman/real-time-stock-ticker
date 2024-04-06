export default function webSocketReducer(state, action) {
    console.log(`State: ${JSON.stringify(state)}\n-----\nAction: ${JSON.stringify(action)}`);
    // console.log(`State: ${(state)}\n-----\nAction: ${JSON.stringify(action)}`);
    if (!state) {
        return state
    }
    switch (action.type) {
        case 'ADD_WATCHLIST':
            console.log(`Adding ${action.payload} to watchlist.`);
            state.socket.sendMessage(action.payload)
            console.log(`Added ${action.payload} to watchlist.`);
            return {
                ...state,
                watchlist: [...(state.watchlist || []), action.payload]
            }
        case 'REMOVE_WATCHLIST':
            return {
                ...state,
                watchlist: state.watchlist.filter((item) => item !== action.payload)
            }
        case 'ADD_STOCK':
            console.log(`Adding ${action.payload} to stock_list.`);
            let existing_watchlist = state.watchlist;
            if (!existing_watchlist.includes(action.payload.symbol)) {
                existing_watchlist = [...existing_watchlist, action.payload.symbol];
            }
            return {
                ...state,
                stock_list: [...(state.stock_list || []), action.payload],
                watchlist: existing_watchlist
            }
        case 'REMOVE_STOCK':
            return {
                ...state,
                stock_list: state.stock_list.filter((item) => item !== action.payload)
            }
        default:
            return state;
    }
}