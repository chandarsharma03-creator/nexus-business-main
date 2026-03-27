import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, DollarSign, TrendingUp, Users, Calendar, Loader2, Plus, X } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import toast from 'react-hot-toast';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

interface Deal {
  _id: string;
  startup: { name: string; logo?: string; industry: string; };
  amount: string;
  equity: string;
  status: string;
  stage: string;
  lastActivity: string;
}

export const DealsPage: React.FC = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [startups, setStartups] = useState<Entrepreneur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    startupId: '',
    amount: '',
    equity: '',
    status: 'Due Diligence',
    stage: 'Seed'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      try {
        const [dealsRes, startupsRes] = await Promise.all([
          fetch(`${API_URL}/deals`, { headers: { 'Authorization': `Bearer ${user.token}` } }),
          fetch(`${API_URL}/users?role=entrepreneur`, { headers: { 'Authorization': `Bearer ${user.token}` } })
        ]);
        const dealsData = await dealsRes.json();
        const startupsData = await startupsRes.json();
        setDeals(dealsData);
        setStartups(startupsData);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/deals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}` 
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create deal');
      const newDeal = await res.json();
      setDeals([newDeal, ...deals]);
      setIsModalOpen(false);
      setFormData({ startupId: '', amount: '', equity: '', status: 'Due Diligence', stage: 'Seed' });
      toast.success('Deal added to pipeline');
    } catch (err) {
      toast.error('Error creating deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats calculation (same as previous response)
  const stats = useMemo(() => {
    const closedDeals = deals.filter(d => d.status === 'Closed');
    const totalValue = closedDeals.reduce((acc, deal) => {
      const num = parseFloat(deal.amount.replace(/[^0-9.]/g, '')) || 0;
      const multiplier = deal.amount.toUpperCase().includes('M') ? 1000000 : deal.amount.toUpperCase().includes('K') ? 1000 : 1;
      return acc + (num * multiplier);
    }, 0);
    return {
      total: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalValue),
      active: deals.filter(d => d.status !== 'Closed' && d.status !== 'Passed').length,
      portfolio: closedDeals.length
    };
  }, [deals]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Deals</h1>
          <p className="text-gray-600">Track your investment pipeline</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Add Deal</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Invested" value={stats.total} icon={<DollarSign />} color="bg-primary-100" />
        <StatCard label="Active Deals" value={stats.active.toString()} icon={<TrendingUp />} color="bg-secondary-100" />
        <StatCard label="Portfolio" value={stats.portfolio.toString()} icon={<Users />} color="bg-accent-100" />
      </div>

      {/* Deals Table */}
      <Card>
        <CardBody>
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm uppercase border-b">
                  <th className="pb-3">Startup</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 flex items-center">
                      <Avatar src={deal.startup.logo || ''} alt="" size="sm" className="mr-3" />
                      <div>
                        <div className="font-medium">{deal.startup.name}</div>
                        <div className="text-xs text-gray-500">{deal.startup.industry}</div>
                      </div>
                    </td>
                    <td className="py-4 font-medium">{deal.amount}</td>
                    <td className="py-4"><Badge variant="primary">{deal.status}</Badge></td>
                    <td className="py-4 text-right"><Button variant="ghost" size="sm">View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* ADD DEAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">New Investment Deal</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Startup</label>
                <select 
                  className="w-full border rounded-md p-2"
                  value={formData.startupId}
                  onChange={(e) => setFormData({...formData, startupId: e.target.value})}
                  required
                >
                  <option value="">Select a startup...</option>
                  {startups.map(s => <option key={s._id} value={s._id}>{s.startupName || s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Amount" placeholder="e.g. $500K" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                <Input label="Equity %" placeholder="e.g. 10%" value={formData.equity} onChange={(e) => setFormData({...formData, equity: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full border rounded-md p-2" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    {['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select className="w-full border rounded-md p-2" value={formData.stage} onChange={(e) => setFormData({...formData, stage: e.target.value})}>
                    {['Pre-Seed', 'Seed', 'Series A', 'Series B'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <Button type="submit" fullWidth isLoading={isSubmitting}>Create Deal</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <Card><CardBody className="flex items-center">
    <div className={`p-3 ${color} rounded-lg mr-4`}>{icon}</div>
    <div><p className="text-sm text-gray-500">{label}</p><p className="text-xl font-bold">{value}</p></div>
  </CardBody></Card>
);