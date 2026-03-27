import {Message} from '../models/message-model.js';
import { User } from '../models/user-model.js';

// @desc    Send a new message
// @route   POST /api/messages/:userId
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const receiverId = req.params.userId;
    const senderId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
      isRead: false
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error sending message', error: error.message });
  }
};

// @desc    Get message history with a specific user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const chatPartnerId = req.params.userId;
    const currentUserId = req.user._id;

    // Find all messages between these two specific users
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: chatPartnerId },
        { senderId: chatPartnerId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 }); // Sort oldest to newest (top to bottom reading)

    // Optional: Mark unread messages from the partner as read since we just opened the chat
    await Message.updateMany(
      { senderId: chatPartnerId, receiverId: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages', error: error.message });
  }
};

// @desc    Get list of conversations for the sidebar
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 1. Fetch all messages involving the current user, sorted newest first
    const allMessages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
    }).sort({ createdAt: -1 });

    // 2. Extract the unique conversation partners and the latest message for each
    const conversationsMap = new Map();

    for (const msg of allMessages) {
      // Determine who the "other" person is in this message
      const partnerId = msg.senderId.toString() === currentUserId.toString() 
        ? msg.receiverId.toString() 
        : msg.senderId.toString();

      // If we haven't seen this partner yet, this is their newest message
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          lastMessage: msg
        });
      }
    }

    // 3. Fetch the User profile details for all those partners
    const partnerIds = Array.from(conversationsMap.keys());
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select('name avatarUrl isOnline');

    // 4. Combine the partner profiles with their last message to match frontend expectations
    const formattedConversations = partners.map(partner => ({
      partner,
      lastMessage: conversationsMap.get(partner._id.toString()).lastMessage
    }));

    // Sort the final array so the conversation with the absolute newest message is at the top
    formattedConversations.sort((a, b) => 
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json(formattedConversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching conversations', error: error.message });
  }
};