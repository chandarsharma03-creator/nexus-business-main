import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import toast from 'react-hot-toast';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  
  // Real-time Data States
  const [entrepreneursList, setEntrepreneursList] = useState<Entrepreneur[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.token) return;
      
      try {
        setIsLoading(true);

        // Fetch all entrepreneurs and the investor's sent requests simultaneously
        const [usersRes, requestsRes] = await Promise.all([
          fetch(`${API_URL}/users?role=entrepreneur`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          }),
          fetch(`${API_URL}/requests/investor`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          })
        ]);

        if (!usersRes.ok || !requestsRes.ok) throw new Error('Failed to load data');

        const usersData = await usersRes.json();
        const requestsData = await requestsRes.json();

        setEntrepreneursList(usersData);
        // Count only 'accepted' requests as active connections
        setConnectionCount(requestsData.filter((req: any) => req.status === 'accepted').length);
        
      } catch (error) {
        console.error('Investor Dashboard Error:', error);
        toast.error('Could not refresh startup feed.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Dynamically get unique industries from the real data fetched from MongoDB
  const industries = Array.from(
    new Set(entrepreneursList.map(e => e.industry).filter(Boolean))
  );

  // Filter logic for the UI
  const filteredEntrepreneurs = entrepreneursList.filter(entrepreneur => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      entrepreneur.name?.toLowerCase().includes(searchLower) ||
      entrepreneur.startupName?.toLowerCase().includes(searchLower) ||
      entrepreneur.industry?.toLowerCase().includes(searchLower) ||
      entrepreneur.pitchSummary?.toLowerCase().includes(searchLower);
    
    const matchesIndustry = selectedIndustries.length === 0 || 
      (entrepreneur.industry && selectedIndustries.includes(entrepreneur.industry));
    
    return matchesSearch && matchesIndustry;
  });

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Startups</h1>
          <p className="text-gray-600">Find and connect with promising entrepreneurs</p>
        </div>
        
        <Link to="/entrepreneurs">
          <Button leftIcon={<PlusCircle size={18} />}>
            View All Startups
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex flex-wrap gap-2">
              {industries.map(industry => (
                <Badge
                  key={industry}
                  variant={selectedIndustries.includes(industry) ? 'primary' : 'gray'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleIndustry(industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary - Now using real-time values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 border border-primary-100 shadow-sm">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4 text-primary-700">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Available Startups</p>
                <h3 className="text-xl font-semibold text-primary-900">{entrepreneursList.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100 shadow-sm">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4 text-secondary-700">
                <PieChart size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Active Industries</p>
                <h3 className="text-xl font-semibold text-secondary-900">{industries.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 border border-accent-100 shadow-sm">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4 text-accent-700">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Your Connections</p>
                <h3 className="text-xl font-semibold text-accent-900">{connectionCount}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Featured Startups Grid */}
      <Card className="shadow-sm">
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Startup Feed</h2>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary-600 mb-2" size={32} />
              <p className="text-gray-500 text-sm">Fetching latest startups...</p>
            </div>
          ) : filteredEntrepreneurs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntrepreneurs.map(entrepreneur => (
                <EntrepreneurCard
                  key={entrepreneur._id || entrepreneur.id}
                  entrepreneur={entrepreneur}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No startups found matching your current criteria.</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndustries([]);
                }}
              >
                Reset all filters
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};