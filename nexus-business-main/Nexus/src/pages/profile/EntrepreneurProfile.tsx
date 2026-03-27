import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, FileText, DollarSign, Send, Loader2 } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import toast from 'react-hot-toast';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequestedCollaboration, setHasRequestedCollaboration] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  
  const isCurrentUser = currentUser?.id === id || currentUser?._id === id;
  const isInvestor = currentUser?.role === 'investor';

  useEffect(() => {
    const fetchProfileData = async () => {
      // 🚨 GUARD CLAUSE: Stop immediately if the ID is missing or literally the string "undefined"
      if (!id || id === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // 1. Fetch the Entrepreneur's profile
        const profileRes = await fetch(`${API_URL}/users/${id}`, {
          headers: { 'Authorization': `Bearer ${currentUser?.token}` }
        });
        
        if (!profileRes.ok) throw new Error('Profile not found');
        const profileData = await profileRes.json();
        setEntrepreneur(profileData);

        // 2. If the current user is an investor, check if they already sent a request
        if (isInvestor && currentUser?.token) {
          const requestsRes = await fetch(`${API_URL}/requests/investor`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
          });
          
          if (requestsRes.ok) {
            const requestsData = await requestsRes.json();
            const alreadyRequested = requestsData.some(
              (req: any) => (req.entrepreneurId._id || req.entrepreneurId) === id
            );
            setHasRequestedCollaboration(alreadyRequested);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Could not load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUser, isInvestor]);
  
  const handleSendRequest = async () => {
    if (!isInvestor || !currentUser || !id || id === 'undefined') return;
    
    try {
      setIsSendingRequest(true);
      const message = `I'm interested in learning more about ${entrepreneur?.startupName || 'your startup'} and would like to explore potential investment opportunities.`;
      
      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ entrepreneurId: id, message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send request');
      }

      toast.success('Collaboration request sent successfully!');
      setHasRequestedCollaboration(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSendingRequest(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Entrepreneur not found</h2>
        <p className="text-gray-600 mt-2">The entrepreneur profile you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={entrepreneur.avatarUrl}
              alt={entrepreneur.name}
              size="xl"
              status={entrepreneur.isOnline ? 'online' : 'offline'}
              className="mx-auto sm:mx-0"
            />
            
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Founder at {entrepreneur.startupName || 'Startup'}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                {entrepreneur.industry && <Badge variant="primary">{entrepreneur.industry}</Badge>}
                {entrepreneur.location && (
                  <Badge variant="gray">
                    <MapPin size={14} className="mr-1" />
                    {entrepreneur.location}
                  </Badge>
                )}
                {entrepreneur.foundedYear && (
                  <Badge variant="accent">
                    <Calendar size={14} className="mr-1" />
                    Founded {entrepreneur.foundedYear}
                  </Badge>
                )}
                {entrepreneur.teamSize && (
                  <Badge variant="secondary">
                    <Users size={14} className="mr-1" />
                    {entrepreneur.teamSize} team members
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <>
                <Link to={`/chat/${entrepreneur._id || entrepreneur.id}`}>
                  <Button variant="outline" leftIcon={<MessageCircle size={18} />}>
                    Message
                  </Button>
                </Link>
                
                {isInvestor && (
                  <Button
                    leftIcon={isSendingRequest ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    disabled={hasRequestedCollaboration || isSendingRequest}
                    onClick={handleSendRequest}
                  >
                    {hasRequestedCollaboration ? 'Request Sent' : 'Request Collaboration'}
                  </Button>
                )}
              </>
            )}
            
            {isCurrentUser && (
              <Link to="/settings">
                <Button variant="outline" leftIcon={<UserCircle size={18} />}>
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">About</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 whitespace-pre-line">{entrepreneur.bio || 'No bio provided.'}</p>
            </CardBody>
          </Card>
          
          {/* Startup Description */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Startup Overview</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Solution</h3>
                  <p className="text-gray-700 mt-1">
                    {entrepreneur.pitchSummary || 'No pitch summary available.'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar - right side */}
        <div className="space-y-6">
          {/* Funding Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Funding</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Current Round Goal</span>
                  <div className="flex items-center mt-1">
                    <DollarSign size={18} className="text-accent-600 mr-1" />
                    <p className="text-lg font-semibold text-gray-900">{entrepreneur.fundingNeeded || 'Undisclosed'}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Documents */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            </CardHeader>
            <CardBody>
              {!isCurrentUser && isInvestor && !hasRequestedCollaboration ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Request access to detailed documents and financials by sending a collaboration request.
                  </p>
                  <Button
                    className="mt-3 w-full"
                    onClick={handleSendRequest}
                    disabled={isSendingRequest}
                    leftIcon={isSendingRequest ? <Loader2 size={16} className="animate-spin" /> : undefined}
                  >
                    Request Collaboration
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    No public documents available yet.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};