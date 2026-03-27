import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard, Loader2, Upload } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL =import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

// --- CLOUDINARY CONFIGURATION ---
// You will get these values from your Cloudinary Dashboard
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_NAME; 
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const SettingsPage: React.FC = () => {
  // Grab updateProfile from context so global state updates instantly!
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    avatarUrl: ''
  });

  // Password State
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load initial user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // --- CLOUDINARY UPLOAD LOGIC ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and size (limit to 2MB)
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB.');
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    try {
      // Upload directly to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image to Cloudinary');

      const data = await response.json();
      
      // Update local state so the user sees the preview instantly
      setProfileData(prev => ({ ...prev, avatarUrl: data.secure_url }));
      toast.success('Photo uploaded! Click Save Changes to apply.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // --- SAVE PROFILE LOGIC ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      // Use the context function so the navbar and global state update immediately!
      await updateProfile(profileData);
      // Note: The toast.success is handled inside updateProfile in AuthContext
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to update password');
      
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="p-2">
            <nav className="space-y-1">
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md">
                <User size={18} className="mr-3" /> Profile
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Lock size={18} className="mr-3" /> Security
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Bell size={18} className="mr-3" /> Notifications
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Globe size={18} className="mr-3" /> Language
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Palette size={18} className="mr-3" /> Appearance
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <CreditCard size={18} className="mr-3" /> Billing
              </button>
            </nav>
          </CardBody>
        </Card>
        
        {/* Main settings content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* Avatar Upload Section */}
                <div className="flex items-center gap-6">
                  {/* Show the preview of the newly uploaded image, or fallback to the current user avatar */}
                  <Avatar src={profileData.avatarUrl} alt={user.name} size="xl" />
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      leftIcon={isUploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    >
                      {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">JPG, GIF or PNG. Max size of 2MB</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input
                    label="Role"
                    value={user.role}
                    disabled
                  />
                  <Input
                    label="Location"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setProfileData({
                      name: user.name || '',
                      email: user.email || '',
                      location: user.location || '',
                      bio: user.bio || '',
                      avatarUrl: user.avatarUrl || ''
                    })}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSavingProfile || isUploadingAvatar} leftIcon={isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : null}>
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
          
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    <Badge variant="error" className="mt-1">Not Enabled</Badge>
                  </div>
                  <Button variant="outline" type="button">Enable</Button>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <Input
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdatingPassword} leftIcon={isUpdatingPassword ? <Loader2 size={16} className="animate-spin" /> : null}>
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </div>
            </CardBody>
          </Card>

        </div>
      </div>
    </div>
  );
};