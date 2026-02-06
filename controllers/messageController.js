import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

/**
 * Send a message
 */
export const sendMessage = async (req, res) => {
    try {
        const { jobId, recipientId, text } = req.body;
        const senderId = req.user._id;

        if (!jobId || !recipientId || !text) {
            return res.status(400).json({
                success: false,
                message: 'Job ID, recipient ID, and text are required',
            });
        }

        const message = new Message({
            jobId,
            sender: senderId,
            recipient: recipientId,
            text,
        });

        await message.save();

        // Touch the job with the latest message so both sides can see the chat at the top of the list
        // (chat list is currently job-based).
        await Job.findByIdAndUpdate(jobId, {
            $set: {
                lastMessageText: text,
                lastMessageAt: message.createdAt || new Date(),
            },
        });

        // Create notification for the recipient ONLY if it's not the sender themselves
        if (String(recipientId) !== String(senderId)) {
            const sender = await User.findById(senderId);
            const job = await Job.findById(jobId);

            // Determine the name to show in notification
            const senderName = sender.fullName || sender.email || "A user";
            const jobCategory = job ? job.category : "a job";

            const notification = new Notification({
                recipient: recipientId,
                type: 'message',
                title: 'New Message 💬',
                message: `${senderName} messaged you about ${jobCategory}: "${text.length > 30 ? text.substring(0, 30) + '...' : text}"`,
                data: {
                    jobId,
                    messageId: message._id,
                    senderId,
                    senderName,
                    senderAvatar: sender.profilePhoto,
                    jobCategory: job.description || job.category
                },
            });
            await notification.save();
        }

        res.status(201).json({
            success: true,
            message,
        });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
        });
    }
};

/**
 * Get messages for a job
 */
export const getMessagesByJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        const messages = await Message.find({ jobId })
            .sort({ createdAt: 1 })
            .populate('sender', 'fullName profilePhoto')
            .populate('recipient', 'fullName profilePhoto');

        // Mark messages as read if recipient is current user
        await Message.updateMany(
            { jobId, recipient: userId, status: { $ne: 'read' } },
            { $set: { status: 'read', readAt: new Date() } }
        );

        res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages',
        });
    }
};

/**
 * Get total unread messages count for user
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await Message.countDocuments({
            recipient: userId,
            status: { $ne: 'read' },
        });

        res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error('Get Unread Count Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
        });
    }
};

/**
 * Get unread messages count grouped by job for current user
 */
export const getUnreadCountsByJobs = async (req, res) => {
    try {
        const userId = req.user._id;

        const counts = await Message.aggregate([
            {
                $match: {
                    recipient: userId,
                    status: { $ne: 'read' }
                }
            },
            {
                $group: {
                    _id: "$jobId",
                    count: { $sum: 1 }
                }
            }
        ]);

        const unreadMap = {};
        counts.forEach(item => {
            unreadMap[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
            unreadCounts: unreadMap,
        });
    } catch (error) {
        console.error('Get Unread Counts By Jobs Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread counts',
        });
    }
};

/**
 * Get conversation list for current user (job-threaded chats).
 * This is message-based (not job-based) so it works even if the job list endpoints
 * don't include a given job for one participant.
 */
export const getMyConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { recipient: userId },
                    ],
                },
            },
            // Ensure $first in the group picks the newest message per job
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$jobId',
                    lastMessageText: { $first: '$text' },
                    lastMessageAt: { $first: '$createdAt' },
                    lastSender: { $first: '$sender' },
                    lastRecipient: { $first: '$recipient' },
                },
            },
            {
                $addFields: {
                    participantId: {
                        $cond: [
                            { $eq: ['$lastSender', userId] },
                            '$lastRecipient',
                            '$lastSender',
                        ],
                    },
                    jobId: '$_id',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'participantId',
                    foreignField: '_id',
                    as: 'participant',
                },
            },
            { $unwind: { path: '$participant', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'job',
                },
            },
            { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    jobId: 1,
                    participantId: 1,
                    participantName: { $ifNull: ['$participant.fullName', 'User'] },
                    participantAvatar: '$participant.profilePhoto',
                    lastMessageText: 1,
                    lastMessageAt: 1,
                    jobCategory: {
                        $ifNull: ['$job.description', '$job.category'],
                    },
                    jobStatus: '$job.status',
                },
            },
            { $sort: { lastMessageAt: -1 } },
            { $limit: 200 },
        ]);

        res.status(200).json({
            success: true,
            count: conversations.length,
            conversations,
        });
    } catch (error) {
        console.error('Get My Conversations Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversations',
        });
    }
};
