import Account from '../models/Fund.js';

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

    res.json({ success: true, accounts: [mummy, vaibhav], message: 'Family targets updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

