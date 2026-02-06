import Job from '../models/Job.js';
import Handyman from '../models/Handyman.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { calculateDistance } from '../utils/calculateDistance.js';

/**
 * Create job request
 * Customer creates a job request for a handyman
 */
export const createJob = async (req, res) => {
  try {
    const { handymanId, category, description, location, preferredTime, price } = req.body;

    // Validate required fields
    if (!handymanId || !category || !description || !location || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if handyman exists and is active
    const handyman = await Handyman.findById(handymanId);
    if (!handyman || !handyman.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Handyman not found or inactive',
      });
    }

    // Validate location coordinates
    if (!location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Valid location coordinates are required',
      });
    }

    // Calculate commission (10% default)
    const commissionRate = parseFloat(process.env.COMMISSION_RATE || 10) / 100;
    const commission = price * commissionRate;

    // Create job
    const job = new Job({
      customerId: req.user._id,
      handymanId,
      category,
      description: description.trim(),
      location: {
        coordinates: [location.coordinates[0], location.coordinates[1]],
        address: location.address || '',
        areaName: location.areaName || '',
      },
      price: parseFloat(price),
      commission,
      preferredTime: preferredTime ? new Date(preferredTime) : undefined,
      status: 'requested',
    });

    await job.save();

    // Populate job details
    await job.populate('handymanId', 'userId skillCategories basePrice rating');
    await job.populate('handymanId.userId', 'fullName profilePhoto');

    // Create notification for handyman
    const notification = new Notification({
      recipient: handyman.userId,
      type: 'job_update',
      title: 'New Job Request! 📬',
      message: `${req.user.fullName || 'A customer'} is requesting your ${job.description || category} services`,
      data: {
        jobId: job._id,
        jobCategory: job.description || category
      },
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Job request created successfully',
      job,
    });
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job request',
      error: error.message,
    });
  }
};

/**
 * Get customer's jobs
 */
export const getCustomerJobs = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { customerId: req.user._id };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('handymanId', 'userId skillCategories basePrice rating')
      .populate({
        path: 'handymanId',
        populate: {
          path: 'userId',
          select: 'fullName profilePhoto phoneNumber'
        }
      })
      // Important for chat list: order by last activity (message) rather than job creation time.
      .sort({ lastMessageAt: -1, updatedAt: -1, createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Get Customer Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get jobs',
      error: error.message,
    });
  }
};

/**
 * Get handyman's jobs
 */
export const getHandymanJobs = async (req, res) => {
  try {
    // Get handyman profile
    const handyman = await Handyman.findOne({ userId: req.user._id });
    if (!handyman) {
      return res.status(404).json({
        success: false,
        message: 'Handyman profile not found',
      });
    }

    const { status } = req.query;

    const query = { handymanId: handyman._id };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('customerId', 'fullName phoneNumber profilePhoto')
      // Important for chat list: order by last activity (message) rather than job creation time.
      .sort({ lastMessageAt: -1, updatedAt: -1, createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Get Handyman Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get jobs',
      error: error.message,
    });
  }
};

/**
 * Accept job request
 */
export const acceptJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { scheduledTime } = req.body;

    // Get handyman profile
    const handyman = await Handyman.findOne({ userId: req.user._id });
    if (!handyman) {
      return res.status(404).json({
        success: false,
        message: 'Handyman profile not found',
      });
    }

    // Find job
    const job = await Job.findOne({
      _id: jobId,
      handymanId: handyman._id,
      status: 'requested',
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or already processed',
      });
    }

    job.status = 'accepted';
    if (scheduledTime) {
      job.scheduledTime = new Date(scheduledTime);
    }
    await job.save();

    // Create notification for customer
    const notification = new Notification({
      recipient: job.customerId,
      type: 'job_update',
      title: 'Job Accepted! ✅',
      message: `${req.user.fullName || 'A handyman'} has accepted your ${job.description || job.category} request`,
      data: {
        jobId: job._id,
        jobCategory: job.description || job.category
      },
    });
    await notification.save();

    // Update handyman stats
    handyman.totalJobs += 1;
    await handyman.save();

    await job.populate('customerId', 'fullName phoneNumber');

    res.status(200).json({
      success: true,
      message: 'Job accepted successfully',
      job,
    });
  } catch (error) {
    console.error('Accept Job Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept job',
      error: error.message,
    });
  }
};

/**
 * Reject job request
 */
export const rejectJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;

    // Get handyman profile
    const handyman = await Handyman.findOne({ userId: req.user._id });
    if (!handyman) {
      return res.status(404).json({
        success: false,
        message: 'Handyman profile not found',
      });
    }

    // Find job
    const job = await Job.findOne({
      _id: jobId,
      handymanId: handyman._id,
      status: 'requested',
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or already processed',
      });
    }

    // Update job status
    job.cancelledAt = new Date();
    await job.save();

    // Create notification for customer
    const notification = new Notification({
      recipient: job.customerId,
      type: 'job_update',
      title: 'Job Request Declined ❌',
      message: `${req.user.fullName || 'The handyman'} has declined your ${job.description || job.category} request. Reason: ${reason || 'Not specified'}`,
      data: {
        jobId: job._id,
        jobCategory: job.description || job.category
      },
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Job rejected successfully',
      job,
    });
  } catch (error) {
    console.error('Reject Job Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject job',
      error: error.message,
    });
  }
};

/**
 * Update job status
 */
export const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    const validStatuses = ['on_the_way', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // Get handyman profile
    const handyman = await Handyman.findOne({ userId: req.user._id });
    if (!handyman) {
      return res.status(404).json({
        success: false,
        message: 'Handyman profile not found',
      });
    }

    // Find job
    const job = await Job.findOne({
      _id: jobId,
      handymanId: handyman._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Validate status transition
    if (status === 'completed' && job.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Job must be in progress before completing',
      });
    }

    // Update status
    job.status = status;
    if (status === 'completed') {
      job.completedAt = new Date();

      // Update handyman stats
      handyman.completedJobs += 1;
      await handyman.save();

      // Create payment record
      const handymanEarning = job.price - job.commission;
      const payment = new Payment({
        jobId: job._id,
        customerId: job.customerId,
        handymanId: job.handymanId,
        amount: job.price,
        commission: job.commission,
        handymanEarning,
        status: 'pending', // Will be marked completed when payment is received
        paymentMethod: 'cash', // Default for MVP
      });
      await payment.save();
    }

    await job.save();

    const statusLabels = {
      on_the_way: 'is on the way',
      in_progress: 'has started working',
      completed: 'has completed the job',
      cancelled: 'has cancelled the job',
    };

    const statusTitles = {
      on_the_way: 'Handyman on the way! 🚚',
      in_progress: 'Service Started! 🛠️',
      completed: 'Job Completed! ✨',
      cancelled: 'Job Cancelled ⛔',
    };

    const notification = new Notification({
      recipient: job.customerId,
      type: 'job_update',
      title: statusTitles[status] || `Job Status: ${status.replace('_', ' ')}`,
      message: `${req.user.fullName || 'The handyman'} ${statusLabels[status] || status} for your ${job.description || job.category} request`,
      data: {
        jobId: job._id,
        jobCategory: job.description || job.category
      },
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      job,
    });
  } catch (error) {
    console.error('Update Job Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status',
      error: error.message,
    });
  }
};

/**
 * Get job by ID
 */
export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('customerId', 'fullName phoneNumber profilePhoto')
      .populate({
        path: 'handymanId',
        populate: {
          path: 'userId',
          select: 'fullName profilePhoto phoneNumber'
        }
      })
      .populate('rating');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if user has access to this job
    const isCustomer = job.customerId._id.toString() === req.user._id.toString();
    const handyman = await Handyman.findOne({ userId: req.user._id });
    const isHandyman = handyman && job.handymanId._id.toString() === handyman._id.toString();

    if (!isCustomer && !isHandyman && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Get Job By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job',
      error: error.message,
    });
  }
};

/**
 * Cancel job (by customer)
 */
export const cancelJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;

    const job = await Job.findOne({
      _id: jobId,
      customerId: req.user._id,
      status: { $in: ['requested', 'accepted'] },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or cannot be cancelled',
      });
    }

    job.status = 'cancelled';
    job.cancelledBy = 'customer';
    job.cancellationReason = reason || 'Customer cancelled';
    job.cancelledAt = new Date();
    await job.save();

    // Create notification for handyman
    const notification = new Notification({
      recipient: job.handymanId.userId || job.handymanId, // Populated might be different
      type: 'job_update',
      title: 'Job Cancelled by Customer ⚠️',
      message: `${req.user.fullName || 'The customer'} has cancelled the ${job.description || job.category} request. Reason: ${reason || 'Not specified'}`,
      data: {
        jobId: job._id,
        jobCategory: job.description || job.category
      },
    });
    // Find the actual user ID of the handyman
    const handyman = await Handyman.findById(job.handymanId);
    if (handyman) {
      notification.recipient = handyman.userId;
      await notification.save();
    }

    res.status(200).json({
      success: true,
      message: 'Job cancelled successfully',
      job,
    });
  } catch (error) {
    console.error('Cancel Job Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel job',
      error: error.message,
    });
  }
};

