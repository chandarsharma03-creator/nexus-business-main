import React, { useState } from 'react';
import { Search, Book, MessageCircle, Phone, Mail, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const faqs = [
  {
    question: 'How do I connect with investors?',
    answer: 'You can browse our investor directory and send connection requests. Once an investor accepts, you can start messaging them directly through our platform.'
  },
  {
    question: 'What should I include in my startup profile?',
    answer: 'Your startup profile should include a compelling pitch, funding needs, team information, market opportunity, and any traction or metrics that demonstrate your progress.'
  },
  {
    question: 'How do I share documents securely?',
    answer: 'You can upload documents to your secure document vault and selectively share them with connected investors. All documents are encrypted and access-controlled.'
  },
  {
    question: 'What are collaboration requests?',
    answer: 'Collaboration requests are formal expressions of interest from investors. They indicate that an investor wants to learn more about your startup and potentially discuss investment opportunities.'
  }
];

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(faq => 
    searchQuery === '' || 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate an API call to a support endpoint
      // e.g., await fetch('/api/support/ticket', { method: 'POST', body: JSON.stringify(formData) })
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Your message has been sent! Our team will contact you soon.');
      
      // Clear form
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600">Find answers to common questions or get in touch with our support team</p>
      </div>
      
      {/* Search */}
      <div className="max-w-2xl">
        <Input
          placeholder="Search help articles..."
          startAdornment={<Search size={18} />}
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick links */}
        <Card>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
              <Book size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Documentation</h2>
            <p className="text-sm text-gray-600 mt-2">
              Browse our detailed documentation and guides
            </p>
            <Button
              variant="outline"
              className="mt-4"
              rightIcon={<ExternalLink size={16} />}
            >
              View Docs
            </Button>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
              <MessageCircle size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Live Chat</h2>
            <p className="text-sm text-gray-600 mt-2">
              Chat with our support team in real-time
            </p>
            <Button className="mt-4">
              Start Chat
            </Button>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-lg mb-4">
              <Phone size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Contact Us</h2>
            <p className="text-sm text-gray-600 mt-2">
              Get help via email or phone
            </p>
            <Button
              variant="outline"
              className="mt-4"
              leftIcon={<Mail size={16} />}
            >
              Contact Support
            </Button>
          </CardBody>
        </Card>
      </div>
      
      {/* FAQs */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No results found for "{searchQuery}"</p>
            )}
          </div>
        </CardBody>
      </Card>
      
      {/* Contact form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Still need help?</h2>
        </CardHeader>
        <CardBody>
          <form className="space-y-6 max-w-2xl" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                required
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
                rows={4}
                placeholder="How can we help you?"
                required
              ></textarea>
            </div>
            
            <div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                leftIcon={isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};