import express from 'express';
import { sendMessage, getMessagesByJob, getUnreadCount, getUnreadCountsByJobs } from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, sendMessage);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/unread-counts', authenticate, getUnreadCountsByJobs);
router.get('/job/:jobId', authenticate, getMessagesByJob);

export default router;
