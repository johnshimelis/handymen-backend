import Rating from '../models/Rating.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import Handyman from '../models/Handyman.js';

/**
 * Create rating for completed job
 */
export const createRating = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Find job
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if job belongs to customer
    if (job.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate your own jobs',
      });
    }

    // Check if job is completed
    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only rate completed jobs',
      });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ jobId });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Job already rated',
      });
    }

    // Create rating
    const newRating = new Rating({
      jobId: job._id,
      customerId: job.customerId,
      handymanId: job.handymanId,
      rating: parseInt(rating),
      comment: comment ? comment.trim() : '',
    });

    await newRating.save();

    // Link rating to job
    job.rating = newRating._id;
    await job.save();

    // Create notification for handyman
    const handymanData = await Handyman.findById(job.handymanId);
    if (handymanData) {
      const notification = new Notification({
        recipient: handymanData.userId,
        type: 'system',
        title: 'New Rating Received! ⭐',
        message: `${req.user.fullName || 'A customer'} has left a ${rating}-star rating for your ${job.category} service.`,
        data: {
          jobId: job._id,
          ratingId: newRating._id,
        },
      });
      await notification.save();
    }

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: newRating,
    });
  } catch (error) {
    console.error('Create Rating Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rating',
      error: error.message,
    });
  }
};

/**
 * Get ratings for a handyman
 */
export const getHandymanRatings = async (req, res) => {
  try {
    const { handymanId } = req.params;

    const ratings = await Rating.find({ handymanId })
      .populate('customerId', 'fullName profilePhoto')
      .populate('jobId', 'category description')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error('Get Handyman Ratings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ratings',
      error: error.message,
    });
  }
};

