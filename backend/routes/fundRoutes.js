import express from 'express';
import * as fundController from '../controllers/fundController.js';
import { updateActualBalance, updateFamilyTargets } from '../controllers/fundController.js';

const router = express.Router();

router.get('/', fundController.getAllAccounts);
router.get('/:id', fundController.getAccountById);
router.post('/', fundController.createAccount);
router.put('/:id', fundController.updateAccount);
router.delete('/:id', fundController.deleteAccount);

router.patch('/:id', updateActualBalance);
router.patch('/family-targets/update', updateFamilyTargets);

// Admin endpoints
router.patch('/:id/target-balance', fundController.updateTargetBalance);
router.patch('/:id/actual-balance', fundController.updateActualBalance);
router.patch('/family-targets/update', fundController.updateFamilyTargets);

export default router;
