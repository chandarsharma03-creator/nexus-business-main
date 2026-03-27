import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

// Defining the shape of the data we expect from our Express backend
interface ConversationItem {
  partner: {
    _id: string;
    id?: string;
    name: string;
    avatarUrl?: string;
    isOnline: boolean;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  };
}

interface ChatUserListProps {
  conversations: ConversationItem[];
}



export const ChatUserList: React.FC<ChatUserListProps> = ({ conversations }) => {
  const navigate = useNavigate();
  const { userId: activeUserId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  if (!currentUser) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const partnerId = conv.partner._id || conv.partner.id;
            const isActive = activeUserId === partnerId;
            const isUnread = conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.senderId !== (currentUser._id || currentUser.id);

            return (
              <div
                key={partnerId}
                onClick={() => navigate(`/chat/${partnerId}`)}
                className={`px-4 py-4 flex items-center cursor-pointer transition-all border-l-4 ${
                  isActive ? 'bg-primary-50 border-primary-600' : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                <Avatar 
                  src={conv.partner.avatarUrl} 
                  alt={conv.partner.name} 
                  size="md" 
                  status={conv.partner.isOnline ? 'online' : 'offline'} 
                  className="flex-shrink-0"
                />
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {conv.partner.name}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage?.senderId === (currentUser._id || currentUser.id) ? 'You: ' : ''}
                      {conv.lastMessage?.content}
                    </p>
                    {isUnread && <div className="w-2 h-2 bg-primary-600 rounded-full ml-2" />}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">No conversations found</div>
        )}
      </div>
    </div>
  );
};