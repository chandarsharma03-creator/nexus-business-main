import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import toast from 'react-hot-toast';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

export const EntrepreneursPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFundingRange, setSelectedFundingRange] = useState<string[]>([]);
  
  // Real Data States
  const [entrepreneursList, setEntrepreneursList] = useState<Entrepreneur[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntrepreneurs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/users?role=entrepreneur`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch startups');
        
        const data = await response.json();
        setEntrepreneursList(data);
      } catch (error) {
        console.error('Error fetching startups:', error);
        toast.error('Could not load startups directory.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchEntrepreneurs();
  }, [user]);
  
  // Get unique industries dynamically from fetched data
  const allIndustries = Array.from(
    new Set(entrepreneursList.map(e => e.industry).filter(Boolean))
  );
  const fundingRanges = ['< $500K', '$500K - $1M', '$1M - $5M', '> $5M'];
  
  // Filter entrepreneurs based on search and filters
  const filteredEntrepreneurs = entrepreneursList.filter(entrepreneur => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      (entrepreneur.name && entrepreneur.name.toLowerCase().includes(searchLower)) ||
      (entrepreneur.startupName && entrepreneur.startupName.toLowerCase().includes(searchLower)) ||
      (entrepreneur.industry && entrepreneur.industry.toLowerCase().includes(searchLower)) ||
      (entrepreneur.pitchSummary && entrepreneur.pitchSummary.toLowerCase().includes(searchLower));
    
    const matchesIndustry = selectedIndustries.length === 0 ||
      (entrepreneur.industry && selectedIndustries.includes(entrepreneur.industry));
    
    // Improved funding range filter to handle potential undefined fields
    const matchesFunding = selectedFundingRange.length === 0 || 
      selectedFundingRange.some(range => {
        const fundingStr = entrepreneur.fundingNeeded || '0';
        // Basic normalization (assumes values like $500K or $1.5M)
        let amount = parseFloat(fundingStr.replace(/[^0-9.]/g, '')) || 0;
        if (fundingStr.toUpperCase().includes('M')) amount *= 1000; // Convert Millions to K
        
        switch (range) {
          case '< $500K': return amount < 500;
          case '$500K - $1M': return amount >= 500 && amount <= 1000;
          case '$1M - $5M': return amount > 1000 && amount <= 5000;
          case '> $5M': return amount > 5000;
          default: return true;
        }
      });
    
    return matchesSearch && matchesIndustry && matchesFunding;
  });
  
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };
  
  const toggleFundingRange = (range: string) => {
    setSelectedFundingRange(prev => 
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Startups</h1>
        <p className="text-gray-600">Discover promising startups looking for investment</p>
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
                <h3 className="text-sm font-medium text-gray-900 mb-2">Industry</h3>
                <div className="space-y-2">
                  {allIndustries.length > 0 ? allIndustries.map(industry => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedIndustries.includes(industry)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {industry}
                    </button>
                  )) : (
                    <p className="text-xs text-gray-500">No industries available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Funding Range</h3>
                <div className="space-y-2">
                  {fundingRanges.map(range => (
                    <button
                      key={range}
                      onClick={() => toggleFundingRange(range)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedFundingRange.includes(range)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Input
              placeholder="Search startups by name, industry, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : `${filteredEntrepreneurs.length} results`}
              </span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
          ) : filteredEntrepreneurs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEntrepreneurs.map(entrepreneur => (
                <EntrepreneurCard
                  key={entrepreneur.id || entrepreneur._id}
                  entrepreneur={entrepreneur}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">No startups match your search criteria.</p>
              <button 
                className="mt-2 text-primary-600 font-medium hover:underline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndustries([]);
                  setSelectedFundingRange([]);
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