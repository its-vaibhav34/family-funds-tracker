import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Mummy', 'Vaibhav'],
    unique: true,
  },
  targetBalance: {
    type: Number,
    required: true,
    default: 0,
  },
  actualBalance: {
    type: Number,
    required: true,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('Account', accountSchema);
