import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile, MessageCircle, Loader2 } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { Message, User } from '../../types';
import toast from 'react-hot-toast';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [isLoadingPartner, setIsLoadingPartner] = useState(false);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  // 1. Load the list of conversations for the sidebar
  const fetchConversations = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentUser]);
  
  // 2. Load the specific chat partner and their messages
  useEffect(() => {
    const fetchChatData = async () => {
      if (!currentUser || !userId) return;
      
      setIsLoadingPartner(true);
      try {
        // Fetch Chat Partner Details
        const partnerRes = await fetch(`${API_URL}/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        
        // Fetch Messages between current user and partner
        const messagesRes = await fetch(`${API_URL}/messages/${userId}`, {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (partnerRes.ok && messagesRes.ok) {
          setChatPartner(await partnerRes.json());
          setMessages(await messagesRes.json());
        }
      } catch (error) {
        toast.error('Could not load chat history.');
      } finally {
        setIsLoadingPartner(false);
      }
    };

    fetchChatData();
  }, [currentUser, userId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 3. Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !userId) return;
    
    const messageContent = newMessage;
    setNewMessage(''); // Clear input immediately for UX
    
    try {
      const res = await fetch(`${API_URL}/messages/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ content: messageContent })
      });

      if (!res.ok) throw new Error('Failed to send message');
      
      const sentMessage = await res.json();
      
      // Add the new message to the chat window
      setMessages(prev => [...prev, sentMessage]);
      
      // Refresh the sidebar to show the latest message snippet
      fetchConversations(); 
    } catch (error) {
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore input if failed
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in">
      {/* Conversations sidebar */}
      <div className="hidden md:block w-1/3 lg:w-1/4 border-r border-gray-200">
        <ChatUserList conversations={conversations} />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {isLoadingPartner ? (
           <div className="h-full flex items-center justify-center">
             <Loader2 className="animate-spin text-primary-600" size={32} />
           </div>
        ) : chatPartner ? (
          <>
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Avatar
                  src={chatPartner.avatarUrl}
                  alt={chatPartner.name}
                  size="md"
                  status={chatPartner.isOnline ? 'online' : 'offline'}
                  className="mr-3"
                />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{chatPartner.name}</h2>
                  <p className="text-sm text-gray-500">
                    {chatPartner.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="rounded-full p-2" aria-label="Voice call">
                  <Phone size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2" aria-label="Video call">
                  <Video size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2" aria-label="Info">
                  <Info size={18} />
                </Button>
              </div>
            </div>
            
            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map(message => (
                    <ChatMessage
                      key={message.id || message._id}
                      message={message}
                      isCurrentUser={message.senderId === currentUser.id || message.senderId === currentUser._id}
                      currentUser={currentUser}
                      chatPartner={chatPartner}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
                  <p className="text-gray-500 mt-1">Send a message to start the conversation</p>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-full p-2">
                  <Smile size={20} />
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  fullWidth
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim()}
                  className="rounded-full w-10 h-10 flex items-center justify-center p-0"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MessageCircle size={48} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-700">Select a conversation</h2>
            <p className="text-gray-500 mt-2 text-center">
              Choose a contact from the list to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};