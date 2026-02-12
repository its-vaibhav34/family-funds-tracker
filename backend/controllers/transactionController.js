import Transaction from '../models/Transaction.js';
import Account from '../models/Fund.js';

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactionsByAccount = async (req, res) => {
  try {
    const transactions = await Transaction.find({ accountId: req.params.accountId }).sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { accountId, accountName, type, amount, description } = req.body;

    if (!accountName || !type || !amount || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'accountName, type, amount, and description are required' 
      });
    }

    // Find account by name (Mummy, Vaibhav) instead of accountId
    const account = await Account.findOne({ name: accountName });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Update account balance based on transaction type
    let newActualBalance = account.actualBalance;
    
    if (type === 'SPEND') {
      if (amount > account.actualBalance) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
      newActualBalance -= amount;
    } else if (type === 'DEPOSIT' || type === 'PAPA_TOPUP') {
      newActualBalance += amount;
    }

    await Account.findByIdAndUpdate(account._id, {
      actualBalance: newActualBalance,
      updatedAt: new Date(),
    });

    const transaction = new Transaction({
      accountId: account._id.toString(),
      accountName,
      type,
      amount,
      description,
    });

    await transaction.save();

    res.status(201).json({ 
      success: true, 
      data: transaction,
      account: { id: account._id.toString(), actualBalance: newActualBalance },
      message: 'Transaction created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const account = await Account.findById(transaction.accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Revert account balance
    let newActualBalance = account.actualBalance;
    
    if (transaction.type === 'SPEND') {
      newActualBalance += transaction.amount;
    } else if (transaction.type === 'DEPOSIT' || transaction.type === 'PAPA_TOPUP') {
      newActualBalance -= transaction.amount;
    }

    await Account.findByIdAndUpdate(transaction.accountId, {
      actualBalance: newActualBalance,
      updatedAt: new Date(),
    });

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

