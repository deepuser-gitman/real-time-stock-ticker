import Stock from '../models/stock.js';

export const getStocks = async (req, res) => {
    const params = req.query
    const find_params = {}
    if (params['symbols']) {
        find_params['symbol'] = {
            $in: params['symbols'].split(',')
        }
    }
    if (params['price_range_min'] || params['price_range_max']) {
        find_params['price'] = {}
        if (params['price_range_min']) {
            find_params['price']['$gte'] = parseFloat(params['price_range_min'])
        }
        if (params['price_range_max']) {
            find_params['price']['$lte'] = params['price_range_max']
        }
    }
    if (params['time_range_start'] || params['time_range_end']) {
        find_params['time'] = {}
        if (params['time_range_start']) {
            find_params['time']['$gte'] = parseFloat(params['time_range_start'])
        }
        if (params['time_range_end']) {
            find_params['time']['$lte'] = params['time_range_end']
        }
    }
    if (params['volume_range_min'] || params['volume_range_max']) {
        find_params['volume'] = {}
        if (params['volume_range_min']) {
            find_params['volume']['$gte'] = parseFloat(params['volume_range_min'])
        }
        if (params['volume_range_max']) {
            find_params['volume']['$lte'] = params['volume_range_max']
        }
    }
    const limit = params['limit'] || 50
    const skip = params['skip'] || 0
    console.log(`Mongo Query: ${JSON.stringify(find_params)}, Skip: ${skip}, Limit: ${limit}`)
    const stocks = Stock.find(find_params).skip(skip).limit(limit).then(result => {
        res.json(result)
    })
    .catch(err => {
        console.log(err);
    });;
    return stocks;
};