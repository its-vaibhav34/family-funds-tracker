import express from 'express';
import * as fundController from '../controllers/fundController.js';
import { updateActualBalance, updateFamilyTargets, resetAllLogs } from '../controllers/fundController.js';

const router = express.Router();

// Admin endpoints - Must be before /:id routes
router.patch('/family-targets/update', updateFamilyTargets);
router.post('/reset-logs', resetAllLogs);

router.get('/', fundController.getAllAccounts);
router.get('/:id', fundController.getAccountById);
router.post('/', fundController.createAccount);
router.put('/:id', fundController.updateAccount);
router.delete('/:id', fundController.deleteAccount);

router.patch('/:id', updateActualBalance);
router.patch('/:id/target-balance', fundController.updateTargetBalance);
router.patch('/:id/actual-balance', fundController.updateActualBalance);

export default router;
