import User from '../models/User.js';
import Handyman from '../models/Handyman.js';
import Job from '../models/Job.js';
import Payment from '../models/Payment.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalHandymen = await User.countDocuments({ role: 'handyman' });

    // Total handymen profiles
    const totalHandymanProfiles = await Handyman.countDocuments();
    const verifiedHandymen = await Handyman.countDocuments({ isVerified: true });
    const activeHandymen = await Handyman.countDocuments({ isActive: true });

    // Job statistics
    const totalJobs = await Job.countDocuments();
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    const activeJobs = await Job.countDocuments({
      status: { $in: ['requested', 'accepted', 'on_the_way', 'in_progress'] },
    });

    // Payment statistics
    const totalPayments = await Payment.countDocuments({ status: 'completed' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$commission' } } },
    ]);
    const totalCommission = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          handymen: totalHandymen,
        },
        handymen: {
          total: totalHandymanProfiles,
          verified: verifiedHandymen,
          active: activeHandymen,
        },
        jobs: {
          total: totalJobs,
          completed: completedJobs,
          active: activeJobs,
        },
        revenue: {
          totalCommission: totalCommission,
          totalPayments: totalPayments,
        },
      },
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message,
    });
  }
};

/**
 * Get all users
 */
export const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-otp')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message,
    });
  }
};

/**
 * Get all handymen
 */
export const getHandymen = async (req, res) => {
  try {
    const { verified, active, page = 1, limit = 20 } = req.query;

    const query = {};
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const handymen = await Handyman.find(query)
      .populate('userId', 'fullName phoneNumber email profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Handyman.countDocuments(query);

    res.status(200).json({
      success: true,
      count: handymen.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      handymen,
    });
  } catch (error) {
    console.error('Get Handymen Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get handymen',
      error: error.message,
    });
  }
};

/**
 * Get all jobs
 */
export const getJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('customerId', 'fullName phoneNumber')
      .populate('handymanId', 'userId')
      .populate('handymanId.userId', 'fullName phoneNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      jobs,
    });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get jobs',
      error: error.message,
    });
  }
};

/**
 * Block/Unblock user
 */
export const toggleUserBlock = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: isBlocked === true },
      { new: true }
    ).select('-otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user,
    });
  } catch (error) {
    console.error('Toggle User Block Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

/**
 * Verify handyman
 */
export const verifyHandyman = async (req, res) => {
  try {
    const { handymanId } = req.params;
    const { isVerified } = req.body;

    const handyman = await Handyman.findByIdAndUpdate(
      handymanId,
      { isVerified: isVerified === true },
      { new: true }
    ).populate('userId', 'fullName phoneNumber');

    if (!handyman) {
      return res.status(404).json({
        success: false,
        message: 'Handyman not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Handyman ${isVerified ? 'verified' : 'unverified'} successfully`,
      handyman,
    });
  } catch (error) {
    console.error('Verify Handyman Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update handyman verification',
      error: error.message,
    });
  }
};

