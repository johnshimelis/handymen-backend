import mongoose from 'mongoose';

/**
 * Job Schema
 * Represents a service request from customer to handyman
 */
const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: false, // Auto-generated in pre-save hook
      unique: true,
      sparse: true,
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
    category: {
      type: String,
      required: [true, 'Service category is required'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    location: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      areaName: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    preferredTime: {
      type: Date,
    },
    scheduledTime: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'handyman', 'admin'],
    },
    rating: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rating',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'mobile_money', 'bank_transfer'],
      default: 'cash',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
jobSchema.index({ customerId: 1, status: 1 });
jobSchema.index({ handymanId: 1, status: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'location.coordinates': '2dsphere' });

// Generate unique job ID before saving
jobSchema.pre('save', async function (next) {
  if (!this.jobId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.jobId = `JOB-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

export default mongoose.model('Job', jobSchema);

