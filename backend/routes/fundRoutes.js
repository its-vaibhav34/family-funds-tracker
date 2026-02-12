import express from 'express';
import * as fundController from '../controllers/fundController.js';
import { updateActualBalance, updateFamilyTargets, resetAllLogs } from '../controllers/fundController.js';

const router = express.Router();

// Admin endpoints - Must be before /:id routes
router.patch('/family-targets/update', updateFamilyTargets);
router.post('/reset-logs', resetAllLogs);

router.get('/', fundController.getAllAccounts);
router.post('/', fundController.createAccount);

// Specific routes before generic /:id routes
router.patch('/:id/target-balance', fundController.updateTargetBalance);
router.patch('/:id/actual-balance', updateActualBalance);

// Generic routes
router.get('/:id', fundController.getAccountById);
router.put('/:id', fundController.updateAccount);
router.delete('/:id', fundController.deleteAccount);

export default router;
