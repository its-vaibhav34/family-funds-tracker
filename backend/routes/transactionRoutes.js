import express from 'express';
import * as transactionController from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', transactionController.getAllTransactions);
router.get('/account/:accountId', transactionController.getTransactionsByAccount);
router.post('/', transactionController.createTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
