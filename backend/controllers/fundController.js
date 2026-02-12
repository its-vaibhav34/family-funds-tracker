import Account from '../models/Fund.js';
import FundMandate from '../models/FundMandate.js';
import Transaction from '../models/Transaction.js';

export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAccount = async (req, res) => {
  try {
    const { name, targetBalance, actualBalance } = req.body;

    if (!name || targetBalance === undefined || actualBalance === undefined) {
      return res.status(400).json({ success: false, message: 'name, targetBalance, and actualBalance are required' });
    }

    const account = new Account({
      name,
      targetBalance,
      actualBalance,
    });

    await account.save();
    res.status(201).json({ success: true, data: account, message: 'Account created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { name, targetBalance, actualBalance } = req.body;

    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { name, targetBalance, actualBalance, updatedAt: new Date() },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, data: account, message: 'Account updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTargetBalance = async (req, res) => {
  try {
    const { newTarget } = req.body;

    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { targetBalance: newTarget, updatedAt: new Date() },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, data: account, message: 'Target balance updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateActualBalance = async (req, res) => {
  try {
    const { newActual } = req.body;

    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { actualBalance: newActual, updatedAt: new Date() },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, data: account, message: 'Actual balance updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFamilyTargets = async (req, res) => {
  try {
    const { mummyTarget, vaibhavTarget } = req.body;

    // Get current values for logging
    const currentMummy = await Account.findOne({ name: 'Mummy' });
    const currentVaibhav = await Account.findOne({ name: 'Vaibhav' });

    // Update accounts
    const mummy = await Account.findOneAndUpdate(
      { name: 'Mummy' },
      { targetBalance: mummyTarget, updatedAt: new Date() },
      { new: true }
    );

    const vaibhav = await Account.findOneAndUpdate(
      { name: 'Vaibhav' },
      { targetBalance: vaibhavTarget, updatedAt: new Date() },
      { new: true }
    );

    if (!mummy || !vaibhav) {
      return res.status(404).json({ success: false, message: 'One or both accounts not found' });
    }

    // Log the change in funds collection
    const fundMandate = new FundMandate({
      changeType: 'FAMILY_GOAL_UPDATE',
      previousMummyTarget: currentMummy?.targetBalance || 0,
      newMummyTarget: mummyTarget,
      previousVaibhavTarget: currentVaibhav?.targetBalance || 0,
      newVaibhavTarget: vaibhavTarget,
      totalFamilyGoal: mummyTarget + vaibhavTarget,
      reason: 'Family goal updated by admin',
    });
    await fundMandate.save();

    res.json({ success: true, accounts: [mummy, vaibhav], message: 'Family targets updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetAllLogs = async (req, res) => {
  try {
    // Delete all transaction logs from 'transactions' collection
    await Transaction.deleteMany({});
    
    // Delete all fund mandate logs from 'funds' collection
    await FundMandate.deleteMany({});

    // Reset account balances to initial values
    await Account.findOneAndUpdate(
      { name: 'Mummy' },
      { actualBalance: 200000, targetBalance: 200000, updatedAt: new Date() }
    );

    await Account.findOneAndUpdate(
      { name: 'Vaibhav' },
      { actualBalance: 100000, targetBalance: 100000, updatedAt: new Date() }
    );

    res.json({ 
      success: true, 
      message: 'All transaction and fund mandate logs deleted, accounts reset to initial state' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
