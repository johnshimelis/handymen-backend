import mongoose from 'mongoose';

/**
 * Rating Schema
 * Stores customer ratings for completed jobs
 */
const ratingSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      unique: true, // One rating per job
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ratingSchema.index({ handymanId: 1 });
ratingSchema.index({ customerId: 1 });
ratingSchema.index({ createdAt: -1 });

// Update handyman rating average after save
ratingSchema.post('save', async function () {
  const Handyman = mongoose.model('Handyman');
  const ratings = await mongoose.model('Rating').find({ handymanId: this.handymanId });
  
  if (ratings.length > 0) {
    const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await Handyman.findByIdAndUpdate(this.handymanId, {
      'rating.average': parseFloat(average.toFixed(2)),
      'rating.count': ratings.length,
    });
  }
});

export default mongoose.model('Rating', ratingSchema);

