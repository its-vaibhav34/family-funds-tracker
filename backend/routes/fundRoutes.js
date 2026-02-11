import express from 'express';
import * as fundController from '../controllers/fundController.js';

const router = express.Router();

router.get('/', fundController.getAllFunds);
router.get('/:id', fundController.getFundById);
router.post('/', fundController.createFund);
router.put('/:id', fundController.updateFund);
router.delete('/:id', fundController.deleteFund);

export default router;
