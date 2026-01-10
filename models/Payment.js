import mongoose from 'mongoose';

/**
 * Payment Schema
 * Tracks payments and commissions
 */
const paymentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    handymanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Handyman',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    commission: {
      type: Number,
      required: true,
      min: 0,
    },
    handymanEarning: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'mobile_money', 'bank_transfer'],
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ jobId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ handymanId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model('Payment', paymentSchema);

