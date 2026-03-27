import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, UserPlus, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

// Fallback dummy data while the backend is being built
const fallbackNotifications = [
  {
    _id: '1',
    type: 'message',
    user: {
      name: 'Sarah Johnson',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    content: 'sent you a message about your startup',
    time: '5 minutes ago',
    unread: true
  },
  {
    _id: '2',
    type: 'connection',
    user: {
      name: 'Michael Rodriguez',
      avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    content: 'accepted your connection request',
    time: '2 hours ago',
    unread: true
  }
];

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>(fallbackNotifications);
  const [isLoading, setIsLoading] = useState(false); // Set to true when fetching real data
  
  useEffect(() => {
    // NOTE: Uncomment this block when you build the GET /api/notifications backend route!
    
    
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
    
  }, [user]);

  const markAllAsRead = async () => {
    // 1. Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    
    // 2. Real API call (Uncomment when backend is ready)
    
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
    } catch(err) {
      console.error('Failed to mark read');
    }
    
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-primary-600" />;
      case 'connection':
        return <UserPlus size={16} className="text-secondary-600" />;
      case 'investment':
        return <DollarSign size={16} className="text-accent-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your network activity</p>
        </div>
        
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card
              key={notification._id || notification.id}
              className={`transition-colors duration-200 ${
                notification.unread ? 'bg-primary-50 border-primary-200' : ''
              }`}
            >
              <CardBody className="flex items-start p-4">
                <Avatar
                  src={notification.user?.avatarUrl}
                  alt={notification.user?.name}
                  size="md"
                  className="flex-shrink-0 mr-4"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {notification.user?.name}
                    </span>
                    {notification.unread && (
                      <Badge variant="primary" size="sm" rounded>New</Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-1">
                    {notification.content}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    {getNotificationIcon(notification.type)}
                    <span>{notification.time || 'Recently'}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No new notifications</h3>
          <p className="text-gray-500 mt-1">We'll let you know when something important happens.</p>
        </div>
      )}
    </div>
  );
};