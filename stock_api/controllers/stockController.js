import Stock from '../models/stock.js';

const getStocks = async (params) => {
    find_params = {}
    if (params['symbols']) {
        find_params['symbol'] = {
            $in: params['symbols']
        }
    }
    if (params['price_range']) {
        find_params['price'] = {
            $gte: params['price_range'][0],
            $lte: params['price_range'][1]
        }
    }
    if (params['time_range']) {
        find_params['time'] = {
            $gte: params['time_range'][0],
            $lte: params['time_range'][1]
        }
    }
    if (params['volume_range']) {
        find_params['volume'] = {
            $gte: params['volume_range'][0],
            $lte: params['volume_range'][1]
        }
    }
    limit = params['limit'] || 50
    skip = params['skip'] || 0
    const stocks = await Stock.find(find_params).skip(skip).limit(limit);
    return stocks;
};