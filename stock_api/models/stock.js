import { Schema, model } from 'mongoose';

const stockSchema = new Schema({
    symbol: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    time: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    }
});

const Stock = model('Stock', stockSchema);
export default Stock;