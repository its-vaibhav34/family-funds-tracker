import mongoose from 'mongoose';

const fundMandateSchema = new mongoose.Schema({
  changeType: {
    type: String,
    enum: ['TARGET_UPDATE', 'FAMILY_GOAL_UPDATE'],
    required: true,
  },
  previousMummyTarget: {
    type: Number,
  },
  newMummyTarget: {
    type: Number,
  },
  previousVaibhavTarget: {
    type: Number,
  },
  newVaibhavTarget: {
    type: Number,
  },
  totalFamilyGoal: {
    type: Number,
  },
  reason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Store in 'funds' collection explicitly
export default mongoose.model('FundMandate', fundMandateSchema, 'funds');
