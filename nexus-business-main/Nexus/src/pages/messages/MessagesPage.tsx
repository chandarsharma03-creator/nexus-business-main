import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { MessageCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/messages/conversations`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        if (!res.ok) throw new Error('Failed to load conversations');
        
        const data = await res.json();
        setConversations(data);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Could not load your messages.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (!user) return null;
  
  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in flex">
      {/* Sidebar showing the loaded conversations */}
      <div className={`${conversations.length > 0 ? 'w-full md:w-1/3 lg:w-1/4 border-r' : 'hidden'} border-gray-200 h-full`}>
        {isLoading ? (
           <div className="flex justify-center py-10">
             <Loader2 className="animate-spin text-primary-600" size={24} />
           </div>
        ) : (
          <ChatUserList conversations={conversations} />
        )}
      </div>

      {/* Empty State Body */}
      <div className={`${conversations.length > 0 ? 'hidden md:flex' : 'flex'} flex-1 flex-col items-center justify-center p-8 bg-gray-50`}>
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <MessageCircle size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-medium text-gray-900">
          {conversations.length > 0 ? 'Select a conversation' : 'No messages yet'}
        </h2>
        <p className="text-gray-600 text-center mt-2 max-w-md">
          {conversations.length > 0 
            ? 'Choose a contact from the sidebar to start chatting.'
            : 'Start connecting with entrepreneurs and investors to begin conversations.'}
        </p>
      </div>
    </div>
  );
};