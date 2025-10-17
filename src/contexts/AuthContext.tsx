import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import ApiService from '../services/api';
import { LocalStorageService } from '../lib/storage';
import { DatabaseService, supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUsersList?: (users: User[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 AuthContext: Initializing...');
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Session persistence disabled - users must login each time
      console.log('✅ AuthContext: Initialized (session persistence disabled)');
    } catch (error) {
      console.error('Error initializing auth:', error);
    }

    setIsLoading(false);
    console.log('✅ AuthContext: Initialization complete');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 AuthContext: Attempting login for:', email);
    setIsLoading(true);

    try {
      let foundUser = null;

      // Try Supabase first
      if (DatabaseService.isAvailable()) {
        console.log('🗄️ Using Supabase authentication...');
        const users = await DatabaseService.getUsers();
        foundUser = users.find(u =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password &&
          u.isActive
        );

        if (foundUser) {
          console.log('✅ Supabase authentication successful');
        }
      }

      // Fallback to localStorage
      if (!foundUser) {
        console.log('📱 Trying localStorage authentication...');
        const users = LocalStorageService.getUsers();
        foundUser = users.find(u =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password &&
          u.isActive
        );

        if (foundUser) {
          console.log('✅ localStorage authentication successful');
        }
      }

      if (!foundUser) {
        console.log('❌ Login failed - user not found or inactive');
        setIsLoading(false);
        return false;
      }

      console.log('✅ AuthContext: Login successful for:', foundUser.name, foundUser.role);
      setUser(foundUser);

      // Session persistence disabled - no session saved
      console.log('✅ AuthContext: Login complete (no session persistence)');

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out');
    
    // Sign out from API if available
    ApiService.logout().catch(console.error);
    
    setUser(null);
    try {
      localStorage.removeItem('current_user');
      localStorage.removeItem('auth_token');
      console.log('✅ AuthContext: Session cleared');
    } catch (error) {
      console.error('❌ AuthContext: Failed to clear session:', error);
    }
  };

  const updateUsersList = (users: User[]) => {
    console.log('📝 AuthContext: Updating users list:', users.length);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUsersList }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}