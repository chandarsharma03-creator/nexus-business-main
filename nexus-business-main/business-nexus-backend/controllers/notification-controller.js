import { Notification } from "../models/notification-model.js";

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: -1 });

    // Format to match your NotificationsPage frontend exactly
    const formattedNotifs = notifications.map(notif => ({
      _id: notif._id,
      type: notif.type,
      user: {
        name: notif.senderId?.name || 'System',
        avatarUrl: notif.senderId?.avatarUrl || ''
      },
      content: notif.content,
      time: notif.createdAt,
      unread: notif.unread
    }));

    res.json(formattedNotifs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications', error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, unread: true },
      { $set: { unread: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notifications', error: error.message });
  }
};