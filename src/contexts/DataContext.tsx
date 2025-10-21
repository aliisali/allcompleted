import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Business, Job, Customer, Notification, Product } from '../types';
import { EmailService } from '../services/EmailService';
import ApiService from '../services/api';
import { LocalStorageService } from '../lib/storage';
import { DatabaseService } from '../lib/supabase';

interface DataContextType {
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User | void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Businesses
  businesses: Business[];
  addBusiness: (business: Omit<Business, 'id' | 'createdAt'>) => Promise<void>;
  updateBusiness: (id: string, business: Partial<Business>) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  
  // Jobs
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer | void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Loading states
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LocalStorageService.forceRefresh();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      if (DatabaseService.isAvailable()) {
        const [usersData, businessesData, jobsData, customersData, productsData, notificationsData] = await Promise.all([
          DatabaseService.getUsers().catch(() => []),
          DatabaseService.getBusinesses().catch(() => []),
          DatabaseService.getJobs().catch(() => []),
          DatabaseService.getCustomers().catch(() => []),
          DatabaseService.getProducts().catch(() => []),
          DatabaseService.getNotifications().catch(() => [])
        ]);

        setUsers(usersData);
        setBusinesses(businessesData);
        setJobs(jobsData);
        setCustomers(customersData);
        setProducts(productsData);
        setNotifications(notificationsData);
      } else {
        LocalStorageService.initializeData();
        setUsers(LocalStorageService.getUsers());
        setBusinesses(LocalStorageService.getBusinesses());
        setJobs(LocalStorageService.getJobs());
        setCustomers(LocalStorageService.getCustomers());
        setProducts(LocalStorageService.getProducts());
        setNotifications(LocalStorageService.getNotifications());
      }
    } catch (error: any) {
      showErrorMessage(`Failed to load data: ${error?.message || 'Unknown error'}`);
      try {
        LocalStorageService.initializeData();
        setUsers(LocalStorageService.getUsers());
        setBusinesses(LocalStorageService.getBusinesses());
        setJobs(LocalStorageService.getJobs());
        setCustomers(LocalStorageService.getCustomers());
        setProducts(LocalStorageService.getProducts());
        setNotifications(LocalStorageService.getNotifications());
      } catch (fallbackError) {
        showErrorMessage('Critical error: Unable to load any data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced data persistence with multiple backends
  const saveToMultipleSources = async (
    operation: 'create' | 'update' | 'delete',
    type: 'user' | 'business' | 'job' | 'customer' | 'product',
    data: any,
    id?: string
  ) => {
    // Try API if Supabase fails
    const operations = [];
    try {
      switch (operation) {
        case 'create':
          if (type === 'user') operations.push(ApiService.createUser(data));
          else if (type === 'business') operations.push(ApiService.createBusiness(data));
          else if (type === 'job') operations.push(ApiService.createJob(data));
          else if (type === 'customer') operations.push(ApiService.createCustomer(data));
          else if (type === 'product') operations.push(ApiService.createProduct(data));
          break;
        case 'update':
          if (id) {
            if (type === 'user') operations.push(ApiService.updateUser(id, data));
            else if (type === 'business') operations.push(ApiService.updateBusiness(id, data));
            else if (type === 'job') operations.push(ApiService.updateJob(id, data));
            else if (type === 'customer') operations.push(ApiService.updateCustomer(id, data));
            else if (type === 'product') operations.push(ApiService.updateProduct(id, data));
          }
          break;
        case 'delete':
          if (id) {
            if (type === 'user') operations.push(ApiService.deleteUser(id));
            else if (type === 'business') operations.push(ApiService.deleteBusiness(id));
            else if (type === 'job') operations.push(ApiService.deleteJob(id));
            else if (type === 'customer') operations.push(ApiService.deleteCustomer(id));
            else if (type === 'product') operations.push(ApiService.deleteProduct(id));
          }
          break;
      }
      
      // Execute API operation
      if (operations.length > 0) {
        await Promise.all(operations);
        console.log(`✅ ${operation} ${type} via API successful`);
        return;
      }
    } catch (apiError) {
      console.log(`API ${operation} failed, using localStorage:`, apiError);
    }
    
    // Final fallback to localStorage
    switch (operation) {
      case 'create':
        if (type === 'user') LocalStorageService.createUser(data);
        else if (type === 'business') LocalStorageService.createBusiness(data);
        else if (type === 'job') LocalStorageService.createJob(data);
        else if (type === 'customer') LocalStorageService.createCustomer(data);
        else if (type === 'product') LocalStorageService.createProduct(data);
        break;
      case 'update':
        if (id) {
          if (type === 'user') LocalStorageService.updateUser(id, data);
          else if (type === 'business') LocalStorageService.updateBusiness(id, data);
          else if (type === 'job') LocalStorageService.updateJob(id, data);
          else if (type === 'customer') LocalStorageService.updateCustomer(id, data);
          else if (type === 'product') LocalStorageService.updateProduct(id, data);
        }
        break;
      case 'delete':
        if (id) {
          if (type === 'user') LocalStorageService.deleteUser(id);
          else if (type === 'business') LocalStorageService.deleteBusiness(id);
          else if (type === 'job') LocalStorageService.deleteJob(id);
          else if (type === 'customer') LocalStorageService.deleteCustomer(id);
          else if (type === 'product') LocalStorageService.deleteProduct(id);
        }
        break;
    }
    console.log(`✅ ${operation} ${type} via localStorage successful`);
  };

  const refreshData = async () => {
    await loadData();
  };

  // User management
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      let newUser: User;
      let businessId = userData.businessId;

      // Auto-create business for business role users if no businessId provided
      if (userData.role === 'business' && !businessId) {
        const newBusiness: Omit<Business, 'id' | 'createdAt'> = {
          name: `${userData.name}'s Business`,
          address: '',
          phone: '',
          email: userData.email,
          adminId: '', // Will be updated after user creation
          features: ['job_management', 'calendar', 'reports'],
          subscription: 'basic',
          vrViewEnabled: false
        };

        if (DatabaseService.isAvailable()) {
          const createdBusiness = await DatabaseService.createBusiness(newBusiness);
          businessId = createdBusiness.id;
          setBusinesses(prev => [...prev, createdBusiness]);
        } else {
          await saveToMultipleSources('create', 'business', newBusiness);
          const businesses = LocalStorageService.getBusinesses();
          businessId = businesses[businesses.length - 1].id;
          setBusinesses(businesses);
        }
      }

      // Create user with business_id
      const userDataWithBusiness = { ...userData, businessId };

      if (DatabaseService.isAvailable()) {
        newUser = await DatabaseService.createUser(userDataWithBusiness);

        // Update business admin_id if this is a business user and we just created their business
        if (userData.role === 'business' && businessId && !userData.businessId) {
          await DatabaseService.updateBusiness(businessId, { adminId: newUser.id });
          setBusinesses(prev => prev.map(b =>
            b.id === businessId ? { ...b, adminId: newUser.id } : b
          ));
        }
      } else {
        await saveToMultipleSources('create', 'user', userDataWithBusiness);
        const users = LocalStorageService.getUsers();
        newUser = users[users.length - 1];
      }

      setUsers(prev => [...prev, newUser]);

      try {
        const businessName = newUser.businessId
          ? businesses.find(b => b.id === newUser.businessId)?.name
          : undefined;

        await EmailService.sendWelcomeEmail({
          name: newUser.name,
          email: newUser.email,
          password: userData.password,
          role: newUser.role,
          businessName
        });
      } catch (emailError) {
        // Silent fail for email
      }

      showSuccessMessage(`User "${userData.name}" created successfully!`);
      return newUser;
    } catch (error) {
      showErrorMessage('Failed to create user. Please try again.');
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      console.log('📝 Updating user:', id);
      
      let success = false;
      
      // Try Supabase first
      // TODO: Implement Supabase integration
      // if (DatabaseService.isAvailable() && DatabaseService.hasValidCredentials()) {
      //   try {
      //     await DatabaseService.updateUser(id, userData);
      //     console.log('✅ User updated via Supabase');
      //     success = true;
      //   } catch (supabaseError) {
      //     console.log('⚠️ Supabase update failed, using localStorage:', supabaseError);
      //   }
      // }
      
      // Fallback to localStorage
      if (!success) {
        LocalStorageService.updateUser(id, userData);
        console.log('✅ User updated via localStorage');
      }
      
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...userData } : user
      ));
      
      // Send password reset email if password was changed
      const originalUser = users.find(u => u.id === id);
      if (userData.password && originalUser) {
        try {
          await EmailService.sendPasswordResetEmail({
            name: originalUser.name,
            email: originalUser.email,
            newPassword: userData.password
          });
          console.log('✅ Password reset email sent to:', originalUser.email);
        } catch (emailError) {
          console.error('⚠️ Failed to send password reset email:', emailError);
        }
      }
      
      showSuccessMessage('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      showErrorMessage('Failed to update user.');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      if (DatabaseService.isAvailable()) {
        await DatabaseService.deleteUser(id);
      } else {
        LocalStorageService.deleteUser(id);
      }

      setUsers(prev => prev.filter(user => user.id !== id));
      showSuccessMessage('User deleted successfully!');
    } catch (error) {
      showErrorMessage('Failed to delete user.');
      throw error;
    }
  };

  // Business management
  const addBusiness = async (businessData: Omit<Business, 'id' | 'createdAt'>) => {
    try {
      let newBusiness: Business;

      if (DatabaseService.isAvailable()) {
        newBusiness = await DatabaseService.createBusiness(businessData);
      } else {
        await saveToMultipleSources('create', 'business', businessData);
        const businesses = LocalStorageService.getBusinesses();
        newBusiness = businesses[businesses.length - 1];
      }

      setBusinesses(prev => [...prev, newBusiness]);
      showSuccessMessage('Business created successfully!');
    } catch (error) {
      showErrorMessage('Failed to create business.');
      throw error;
    }
  };

  const updateBusiness = async (id: string, businessData: Partial<Business>) => {
    try {
      if (DatabaseService.isAvailable()) {
        await DatabaseService.updateBusiness(id, businessData);
      } else {
        await saveToMultipleSources('update', 'business', businessData, id);
      }

      setBusinesses(prev => prev.map(business =>
        business.id === id ? { ...business, ...businessData } : business
      ));
      showSuccessMessage('Business updated successfully!');
    } catch (error) {
      showErrorMessage('Failed to update business.');
      throw error;
    }
  };

  const deleteBusiness = async (id: string) => {
    try {
      if (DatabaseService.isAvailable()) {
        await DatabaseService.deleteBusiness(id);
      } else {
        await saveToMultipleSources('delete', 'business', null, id);
      }

      setBusinesses(prev => prev.filter(business => business.id !== id));
      showSuccessMessage('Business deleted successfully!');
    } catch (error) {
      showErrorMessage('Failed to delete business.');
      throw error;
    }
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'createdAt'>) => {
    try {
      let newJob: Job;

      if (DatabaseService.isAvailable()) {
        newJob = await DatabaseService.createJob(jobData);
      } else {
        await saveToMultipleSources('create', 'job', jobData);
        const jobs = LocalStorageService.getJobs();
        newJob = jobs[jobs.length - 1];
      }

      setJobs(prev => [...prev, newJob]);
      showSuccessMessage('Job created successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create job.';
      showErrorMessage(errorMessage);
      throw error;
    }
  };

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      if (DatabaseService.isAvailable()) {
        await DatabaseService.updateJob(id, jobData);
      } else {
        await saveToMultipleSources('update', 'job', jobData, id);
      }

      setJobs(prev => prev.map(job =>
        job.id === id ? { ...job, ...jobData } : job
      ));

      if (jobData.status === 'completed' || jobData.status === 'in-progress') {
        setTimeout(() => refreshData(), 500);
      }

      showSuccessMessage('Job updated successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update job.';
      showErrorMessage(errorMessage);
      throw error;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      if (DatabaseService.isAvailable()) {
        await DatabaseService.deleteJob(id);
      } else {
        await saveToMultipleSources('delete', 'job', null, id);
      }

      setJobs(prev => prev.filter(job => job.id !== id));
      showSuccessMessage('Job deleted successfully!');
    } catch (error) {
      showErrorMessage('Failed to delete job.');
      throw error;
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      let newCustomer: Customer;

      if (DatabaseService.isAvailable()) {
        newCustomer = await DatabaseService.createCustomer(customerData);
      } else {
        await saveToMultipleSources('create', 'customer', customerData);
        const customers = LocalStorageService.getCustomers();
        newCustomer = customers[customers.length - 1];
      }

      setCustomers(prev => [...prev, newCustomer]);
      showSuccessMessage('Customer added successfully!');
      return newCustomer;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create customer.';
      showErrorMessage(errorMessage);
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      if (DatabaseService.isAvailable()) {
        await DatabaseService.updateCustomer(id, customerData);
      } else {
        await saveToMultipleSources('update', 'customer', customerData, id);
      }

      setCustomers(prev => prev.map(customer =>
        customer.id === id ? { ...customer, ...customerData } : customer
      ));

      showSuccessMessage('Customer updated successfully!');
    } catch (error) {
      showErrorMessage('Failed to update customer.');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      if (DatabaseService.isAvailable()) {
        await DatabaseService.deleteCustomer(id);
      } else {
        await saveToMultipleSources('delete', 'customer', null, id);
      }

      setCustomers(prev => prev.filter(customer => customer.id !== id));
      showSuccessMessage('Customer deleted successfully!');
    } catch (error) {
      showErrorMessage('Failed to delete customer.');
      throw error;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      let newProduct: Product;

      if (DatabaseService.isAvailable()) {
        newProduct = await DatabaseService.createProduct(productData);
      } else {
        await saveToMultipleSources('create', 'product', productData);
        const products = LocalStorageService.getProducts();
        newProduct = products[products.length - 1];
      }

      setProducts(prev => [...prev, newProduct]);
      showSuccessMessage('Product added successfully!');
    } catch (error) {
      showErrorMessage('Failed to add product.');
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      if (DatabaseService.isAvailable()) {
        await DatabaseService.updateProduct(id, productData);
      } else {
        await saveToMultipleSources('update', 'product', productData, id);
      }

      setProducts(prev => prev.map(product =>
        product.id === id ? { ...product, ...productData } : product
      ));
      showSuccessMessage('Product updated successfully!');
    } catch (error) {
      showErrorMessage('Failed to update product.');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      if (DatabaseService.isAvailable()) {
        await DatabaseService.deleteProduct(id);
      } else {
        await saveToMultipleSources('delete', 'product', null, id);
      }

      setProducts(prev => prev.filter(product => product.id !== id));
      showSuccessMessage('Product deleted successfully!');
    } catch (error) {
      showErrorMessage('Failed to delete product.');
      throw error;
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const newNotification = LocalStorageService.createNotification(notificationData);
      setNotifications(prev => [...prev, newNotification]);
    } catch (error) {
      // Silent fail
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      LocalStorageService.markNotificationRead(id);
      setNotifications(prev => prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      // Silent fail
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        const filtered = notifications.filter((n: Notification) => n.id !== id);
        localStorage.setItem('notifications', JSON.stringify(filtered));
      }
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      // Silent fail
    }
  };

  // Helper functions for notifications
  const showSuccessMessage = (message: string) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-all duration-300';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      successDiv.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 300);
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-all duration-300';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      errorDiv.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 300);
    }, 3000);
  };

  return (
    <DataContext.Provider value={{
      users,
      addUser,
      updateUser,
      deleteUser,
      businesses,
      addBusiness,
      updateBusiness,
      deleteBusiness,
      jobs,
      addJob,
      updateJob,
      deleteJob,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      notifications,
      addNotification,
      markNotificationRead,
      deleteNotification,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      loading,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}