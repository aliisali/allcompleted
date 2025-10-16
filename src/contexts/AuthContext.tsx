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
      // Check for stored user session
      const storedUser = localStorage.getItem('current_user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ AuthContext: Found stored session for:', parsedUser.email);

          // Verify user still exists in Supabase or localStorage
          let userExists = false;

          if (DatabaseService.isAvailable()) {
            const users = await DatabaseService.getUsers();
            userExists = users.some(u => u.id === parsedUser.id && u.isActive);
          } else {
            const users = LocalStorageService.getUsers();
            userExists = users.some(u => u.id === parsedUser.id && u.isActive);
          }

          if (userExists) {
            setUser(parsedUser);
          } else {
            console.log('⚠️ AuthContext: Stored user no longer exists, clearing session');
            localStorage.removeItem('current_user');
          }
        } catch (error) {
          console.error('❌ AuthContext: Failed to parse stored user:', error);
          localStorage.removeItem('current_user');
        }
      }
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

      // Save session
      try {
        localStorage.setItem('current_user', JSON.stringify(foundUser));
        console.log('✅ AuthContext: Session saved');
      } catch (error) {
        console.error('❌ AuthContext: Failed to save session:', error);
      }

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