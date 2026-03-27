import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'business_nexus_user';
const API_URL = import.meta.env.VITE_API_KEY || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // 2. Heartbeat Logic: Send a "ping" to the backend every 60 seconds
  useEffect(() => {
    let statusInterval: NodeJS.Timeout;

    const sendPing = async () => {
      if (user?.token) {
        try {
          await fetch(`${API_URL}/users/ping`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
        } catch (err) {
          // Fail silently to avoid interrupting user experience
          console.debug("Heartbeat ping failed");
        }
      }
    };

    if (user) {
      sendPing(); // Ping immediately on load/login
      statusInterval = setInterval(sendPing, 60000); // Ping every minute
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [user]);

  const login = async (email: string, password: string, role?: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to login');

      if (role && data.role !== role) {
        throw new Error(`Access denied. You are registered as an ${data.role}.`);
      }

      setUser(data);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      toast.success('Successfully logged in!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to register');

      setUser(data);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Tell the backend to set isOnline to false immediately
      if (user?.token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
      }
    } catch (err) {
      console.error("Logout notification failed");
    } finally {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user?.token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify(updates),
      });

      const updatedUser = await response.json();
      if (!response.ok) throw new Error(updatedUser.message || 'Failed to update profile');

      const newUserData = { ...updatedUser, token: user.token }; 
      setUser(newUserData);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUserData));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to process request');
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reset password');
      toast.success('Password reset successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};