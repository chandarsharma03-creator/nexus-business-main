import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { Investor } from '../../types';
import toast from 'react-hot-toast';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

export const InvestorsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Real Data States
  const [investorsList, setInvestorsList] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/users?role=investor`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch investors');
        
        const data = await response.json();
        setInvestorsList(data);
      } catch (error) {
        console.error('Error fetching investors:', error);
        toast.error('Could not load investors directory.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchInvestors();
  }, [user]);

  // Get unique investment stages and interests dynamically
  const allStages = Array.from(new Set(investorsList.flatMap(i => i.investmentStage || [])));
  const allInterests = Array.from(new Set(investorsList.flatMap(i => i.investmentInterests || [])));
  
  // Filter investors based on search and filters
  const filteredInvestors = investorsList.filter(investor => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      (investor.name && investor.name.toLowerCase().includes(searchLower)) ||
      (investor.bio && investor.bio.toLowerCase().includes(searchLower)) ||
      (investor.investmentInterests && investor.investmentInterests.some(interest => 
        interest.toLowerCase().includes(searchLower)
      ));
    
    const matchesStages = selectedStages.length === 0 ||
      (investor.investmentStage && investor.investmentStage.some(stage => selectedStages.includes(stage)));
    
    const matchesInterests = selectedInterests.length === 0 ||
      (investor.investmentInterests && investor.investmentInterests.some(interest => selectedInterests.includes(interest)));
    
    return matchesSearch && matchesStages && matchesInterests;
  });
  
  const toggleStage = (stage: string) => {
    setSelectedStages(prev => 
      prev.includes(stage)
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };
  
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Investors</h1>
        <p className="text-gray-600">Connect with investors who match your startup's needs</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Investment Stage</h3>
                <div className="space-y-2">
                  {allStages.length > 0 ? allStages.map(stage => (
                    <button
                      key={stage}
                      onClick={() => toggleStage(stage)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedStages.includes(stage)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {stage}
                    </button>
                  )) : (
                     <p className="text-xs text-gray-500">No stages available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Investment Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {allInterests.length > 0 ? allInterests.map(interest => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? 'primary' : 'gray'}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  )) : (
                    <p className="text-xs text-gray-500">No interests available</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Input
              placeholder="Search investors by name, interests, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : `${filteredInvestors.length} results`}
              </span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
          ) : filteredInvestors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInvestors.map(investor => (
                <InvestorCard
                  key={investor.id || investor._id}
                  investor={investor}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">No investors match your search criteria.</p>
              <button 
                className="mt-2 text-primary-600 font-medium hover:underline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStages([]);
                  setSelectedInterests([]);
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};