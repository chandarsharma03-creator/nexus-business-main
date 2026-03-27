import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile, MessageCircle, Loader2, X, MapPin, Calendar, Building2 } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { Message, User } from '../../types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatPartner, setChatPartner] = useState<User | any>(null);
  const [isLoadingPartner, setIsLoadingPartner] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 1. Fetch all conversations for the sidebar
  const fetchConversations = async () => {
    if (!currentUser?.token) return;
    try {
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      if (res.ok) setConversations(await res.json());
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // 2. Fetch messages for the active chat
  const fetchMessages = async () => {
    if (!currentUser?.token || !userId || userId === 'undefined') return;
    try {
      const res = await fetch(`${API_URL}/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Initial load and sidebar refresh
  useEffect(() => {
    fetchConversations();
  }, [currentUser, userId]);

  // Handle active chat partner and message history
  useEffect(() => {
    const loadChatPartner = async () => {
      if (!currentUser || !userId || userId === 'undefined') return;
      setIsLoadingPartner(true);
      try {
        const partnerRes = await fetch(`${API_URL}/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (partnerRes.ok) setChatPartner(await partnerRes.json());
        await fetchMessages();
      } catch (error) {
        toast.error('Could not load chat.');
      } finally {
        setIsLoadingPartner(false);
      }
    };
    loadChatPartner();
  }, [userId, currentUser]);

  // Real-time simulation: Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) fetchMessages();
      fetchConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !userId) return;
    
    const content = newMessage;
    setNewMessage('');
    
    try {
      const res = await fetch(`${API_URL}/messages/${userId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${currentUser.token}` 
        },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error();
      const sentMessage = await res.json();
      setMessages(prev => [...prev, sentMessage]);
      fetchConversations(); 
    } catch (error) {
      toast.error('Failed to send');
      setNewMessage(content);
    }
  };

  // UI Actions
  const handleCall = () => toast.success(`Calling ${chatPartner?.name}...`);
  const handleVideo = () => toast.success(`Starting video with ${chatPartner?.name}...`);
  const viewProfile = () => navigate(`/profile/${chatPartner?.role}/${chatPartner?._id || chatPartner?.id}`);

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
      {/* Conversations Sidebar */}
      <div className="hidden md:block w-80 border-r border-gray-200 bg-gray-50/30">
        <ChatUserList conversations={conversations} />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {isLoadingPartner ? (
           <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
        ) : chatPartner ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
              <div className="flex items-center cursor-pointer" onClick={viewProfile}>
                <Avatar src={chatPartner.avatarUrl} alt={chatPartner.name} size="md" status={chatPartner.isOnline ? 'online' : 'offline'} className="mr-3" />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate">{chatPartner.name}</h2>
                  <p className={`text-xs ${chatPartner.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                    {chatPartner.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0" onClick={handleCall}><Phone size={18} /></Button>
                <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0" onClick={handleVideo}><Video size={18} /></Button>
                <Button 
                  variant={showInfo ? "secondary" : "ghost"} 
                  size="sm" className="rounded-full h-10 w-10 p-0" 
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info size={18} />
                </Button>
              </div>
            </div>
            
            {/* Messages List */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-4">
              {messages.length > 0 ? (
                <>
                  {messages.map(msg => (
                    <ChatMessage
                      key={msg._id || (msg as any).id}
                      message={msg}
                      isCurrentUser={msg.senderId === (currentUser._id || currentUser.id)}
                      currentUser={currentUser}
                      chatPartner={chatPartner}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                   <MessageCircle size={48} className="mb-2 opacity-20" />
                   <p>No messages yet. Say hello!</p>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <Button type="button" variant="ghost" className="rounded-full p-2 text-gray-400"><Smile size={20} /></Button>
                <Input 
                  type="text" 
                  placeholder="Type your message..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  className="flex-1 bg-gray-100 border-none focus:ring-2 focus:ring-primary-500" 
                />
                <Button type="submit" disabled={!newMessage.trim()} className="rounded-full h-10 w-10 p-0 shadow-md">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-4">
              <MessageCircle size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Messages</h2>
            <p className="text-gray-500 max-w-xs mt-2">Select a conversation from the sidebar to start collaborating.</p>
          </div>
        )}
      </div>

      {/* User Info Sidebar */}
      {showInfo && chatPartner && (
        <div className="w-72 border-l border-gray-200 bg-white animate-slide-in-right hidden lg:flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <span className="font-bold text-gray-700">Details</span>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
            <Avatar src={chatPartner.avatarUrl} alt={chatPartner.name} size="xl" className="mb-4 shadow-sm" />
            <h3 className="font-bold text-lg text-gray-900">{chatPartner.name}</h3>
            <Badge variant="primary" className="mt-1 capitalize">{chatPartner.role}</Badge>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</p>
              <p className="text-sm text-gray-600 mt-1 italic">"{chatPartner.bio || 'No bio available'}"</p>
            </div>
            <div className="space-y-3 pt-2">
              {chatPartner.startupName && (
                <div className="flex items-center text-sm text-gray-600"><Building2 size={16} className="mr-3 text-primary-500" /> {chatPartner.startupName}</div>
              )}
              {chatPartner.location && (
                <div className="flex items-center text-sm text-gray-600"><MapPin size={16} className="mr-3 text-primary-500" /> {chatPartner.location}</div>
              )}
              <div className="flex items-center text-sm text-gray-600"><Calendar size={16} className="mr-3 text-primary-500" /> Member since {new Date(chatPartner.createdAt).getFullYear()}</div>
            </div>
            <Button variant="outline" fullWidth className="mt-4" onClick={viewProfile}>View Profile</Button>
          </div>
        </div>
      )}
    </div>
  );
};



export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser, currentUser, chatPartner }) => {
  const user = isCurrentUser ? currentUser : chatPartner;
  const timestamp = message.createdAt || message.timestamp || new Date();
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      {!isCurrentUser && <Avatar src={user?.avatarUrl} alt={user?.name || 'User'} size="sm" className="mr-2 self-end flex-shrink-0" />}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <div className={`px-4 py-2 rounded-2xl ${isCurrentUser ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
          <p className="text-sm break-words leading-relaxed">{message.content}</p>
        </div>
        <span className="text-[10px] text-gray-400 mt-1 font-medium px-1">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </span>
      </div>
      {isCurrentUser && <Avatar src={user?.avatarUrl} alt={user?.name || 'User'} size="sm" className="ml-2 self-end flex-shrink-0" />}
    </div>
  );
};
 