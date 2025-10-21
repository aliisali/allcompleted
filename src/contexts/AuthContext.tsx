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
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedUser = localStorage.getItem('current_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('current_user');
          }
        } catch (e) {
          localStorage.removeItem('current_user');
        }
      }
    } catch (error) {
      localStorage.removeItem('current_user');
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      setIsLoading(false);
      return false;
    }

    setIsLoading(true);

    try {
      let foundUser = null;

      if (DatabaseService.isAvailable()) {
        const users = await DatabaseService.getUsers();
        foundUser = users.find(u =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password &&
          u.isActive
        );
      }

      if (!foundUser) {
        const users = LocalStorageService.getUsers();
        foundUser = users.find(u =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password &&
          u.isActive
        );
      }

      if (!foundUser) {
        setIsLoading(false);
        return false;
      }

      setUser(foundUser);
      localStorage.setItem('current_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    ApiService.logout().catch(() => {});
    setUser(null);
    try {
      localStorage.removeItem('current_user');
      localStorage.removeItem('auth_token');
    } catch (error) {
      // Silent fail
    }
  };

  const updateUsersList = (users: User[]) => {
    if (user && users) {
      const updatedUser = users.find(u => u.id === user.id);
      if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(user)) {
        setUser(updatedUser);
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
      }
    }
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