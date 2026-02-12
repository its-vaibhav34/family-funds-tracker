import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    enum: ['Mummy', 'Vaibhav'],
    required: true,
  },
  type: {
    type: String,
    enum: ['SPEND', 'DEPOSIT', 'PAPA_TOPUP'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Transaction', transactionSchema);
