import { Router } from 'express';
import { getStocks } from '../controllers/stockController.js';

const router = Router();

router.get('/', getStocks);

export default router;