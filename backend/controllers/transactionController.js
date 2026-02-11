import Transaction from '../models/Transaction.js';
import Fund from '../models/Fund.js';

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('fundId');
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactionsByFund = async (req, res) => {
  try {
    const transactions = await Transaction.find({ fundId: req.params.fundId }).populate('fundId');
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { fundId, type, amount, category, description, date, createdBy } = req.body;

    if (!fundId || !type || !amount || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'fundId, type, amount, and date are required' 
      });
    }

    const fund = await Fund.findById(fundId);
    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }

    const transaction = new Transaction({
      fundId,
      type,
      amount,
      category,
      description,
      date,
      createdBy,
    });

    await transaction.save();

    // Update fund's total amount
    if (type === 'income') {
      fund.totalAmount += amount;
    } else if (type === 'expense') {
      fund.totalAmount -= amount;
    }
    await fund.save();

    res.status(201).json({ 
      success: true, 
      data: transaction, 
      message: 'Transaction created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, createdBy } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const fund = await Fund.findById(transaction.fundId);

    // Revert old transaction amount
    if (transaction.type === 'income') {
      fund.totalAmount -= transaction.amount;
    } else if (transaction.type === 'expense') {
      fund.totalAmount += transaction.amount;
    }

    // Apply new transaction amount
    if (type === 'income') {
      fund.totalAmount += amount;
    } else if (type === 'expense') {
      fund.totalAmount -= amount;
    }

    await fund.save();

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { type, amount, category, description, date, createdBy, updatedAt: new Date() },
      { new: true }
    );

    res.json({ 
      success: true, 
      data: updatedTransaction, 
      message: 'Transaction updated successfully' 
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

    const fund = await Fund.findById(transaction.fundId);

    // Revert transaction amount
    if (transaction.type === 'income') {
      fund.totalAmount -= transaction.amount;
    } else if (transaction.type === 'expense') {
      fund.totalAmount += transaction.amount;
    }

    await fund.save();
    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
