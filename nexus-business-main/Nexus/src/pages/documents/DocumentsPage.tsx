import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Share2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

interface DocumentItem {
  _id: string;
  id?: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  fileUrl?: string;
}

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Ref to trigger the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/documents`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch documents');
        
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Could not load documents.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchDocuments();
  }, [user]);

  // 2. Handle File Selection and Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Check file size on frontend (e.g., limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);
    
    // We MUST use FormData to send files via fetch
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user?.token}` 
          // CRITICAL: Do NOT set 'Content-Type': 'multipart/form-data'. 
          // The browser sets it automatically with the correct boundary when passing FormData.
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload document');

      const newDoc = await response.json();
      
      // Update UI immediately with the new document at the top
      setDocuments(prev => [{
        ...newDoc,
        // Format properties locally to match the UI immediately without re-fetching
        lastModified: new Date().toISOString().split('T')[0],
        fileUrl: `http://localhost:5000${newDoc.fileUrl}`
      }, ...prev]);
      
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
      // Reset the input so the user can upload the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 3. Handle Delete (Now wired to the real backend!)
  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const response = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Document deleted');
      setDocuments(prev => prev.filter(d => (d._id || d.id) !== docId));
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files</p>
        </div>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.png" 
        />
        
        {/* Button triggers the hidden input */}
        <Button 
          leftIcon={isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">12.5 GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-600 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">7.5 GB</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Access</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Recent Files
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Shared with Me
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Starred
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Trash
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Sort by</Button>
                <Button variant="outline" size="sm">Filter</Button>
              </div>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div
                      key={doc._id || doc.id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg mr-4 flex-shrink-0">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </h3>
                          {doc.shared && (
                            <Badge variant="secondary" size="sm">Shared</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Modified {doc.lastModified}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          aria-label="Download"
                          onClick={() => {
                             if (doc.fileUrl) window.open(doc.fileUrl, '_blank');
                          }}
                        >
                          <Download size={18} />
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="p-2" aria-label="Share">
                          <Share2 size={18} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-error-600 hover:text-error-700"
                          aria-label="Delete"
                          onClick={() => handleDelete(doc._id || doc.id as string)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-sm font-medium text-gray-900">No documents</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by uploading your first document.</p>
                  <div className="mt-6">
                    <Button 
                      leftIcon={<Upload size={18} />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Document
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};