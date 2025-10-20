import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Job, User, Customer, Notification } from '../types';

/**
 * Custom hook that provides role-based filtered data
 * Implements the hierarchy: SuperAdmin > Business > Employee
 */
export function useRoleBasedData() {
  const { user: currentUser } = useAuth();
  const { jobs, users, customers, notifications } = useData();

  // Filter jobs based on user role
  const filteredJobs = useMemo(() => {
    if (!currentUser) return [];

    console.log('🔒 Role-based filter - User:', currentUser.role, 'BusinessId:', currentUser.businessId);

    // SuperAdmin sees everything
    if (currentUser.role === 'admin') {
      console.log('✅ Admin: Showing all', jobs.length, 'jobs');
      return jobs;
    }

    // Business sees only their business jobs
    if (currentUser.role === 'business') {
      const filtered = jobs.filter(job => job.businessId === currentUser.businessId);
      console.log('✅ Business: Filtered', filtered.length, 'of', jobs.length, 'jobs for businessId:', currentUser.businessId);
      return filtered;
    }

    // Employee sees only their assigned jobs
    if (currentUser.role === 'employee') {
      const filtered = jobs.filter(job =>
        job.employeeId === currentUser.id &&
        job.businessId === currentUser.businessId
      );
      console.log('✅ Employee: Filtered', filtered.length, 'of', jobs.length, 'jobs for employeeId:', currentUser.id);
      return filtered;
    }

    return [];
  }, [jobs, currentUser]);

  // Filter users based on role
  const filteredUsers = useMemo(() => {
    if (!currentUser) return [];

    // SuperAdmin sees all users
    if (currentUser.role === 'admin') {
      return users;
    }

    // Business sees only their employees
    if (currentUser.role === 'business') {
      return users.filter(user =>
        user.businessId === currentUser.businessId ||
        user.id === currentUser.id // Include self
      );
    }

    // Employees see only themselves and other employees in their business
    if (currentUser.role === 'employee') {
      return users.filter(user =>
        user.businessId === currentUser.businessId &&
        user.role === 'employee'
      );
    }

    return [];
  }, [users, currentUser]);

  // Filter customers based on role
  const filteredCustomers = useMemo(() => {
    if (!currentUser) return [];

    // SuperAdmin sees all customers
    if (currentUser.role === 'admin') {
      return customers;
    }

    // Business sees only their customers
    if (currentUser.role === 'business') {
      return customers.filter(customer => customer.businessId === currentUser.businessId);
    }

    // Employees see customers from jobs assigned to them
    if (currentUser.role === 'employee') {
      const employeeJobCustomerIds = new Set(
        filteredJobs.map(job => job.customerId)
      );
      return customers.filter(customer =>
        customer.businessId === currentUser.businessId &&
        employeeJobCustomerIds.has(customer.id)
      );
    }

    return [];
  }, [customers, currentUser, filteredJobs]);

  // Filter notifications based on role
  const filteredNotifications = useMemo(() => {
    if (!currentUser) return [];

    // SuperAdmin sees system-wide notifications
    if (currentUser.role === 'admin') {
      return notifications;
    }

    // Business and employees see only their own notifications
    return notifications.filter(notification => notification.userId === currentUser.id);
  }, [notifications, currentUser]);

  // Calculate stats based on filtered data
  const stats = useMemo(() => {
    const completedJobs = filteredJobs.filter(job => job.status === 'completed');
    const pendingJobs = filteredJobs.filter(job => job.status === 'pending');
    const inProgressJobs = filteredJobs.filter(job => job.status === 'in-progress');
    const cancelledJobs = filteredJobs.filter(job => job.status === 'cancelled');

    return {
      totalJobs: filteredJobs.length,
      completedJobs: completedJobs.length,
      pendingJobs: pendingJobs.length,
      inProgressJobs: inProgressJobs.length,
      cancelledJobs: cancelledJobs.length,
      totalRevenue: completedJobs.reduce((sum, job) => sum + (job.invoice || job.quotation || 0), 0),
      activeEmployees: filteredUsers.filter(user => user.role === 'employee' && user.isActive).length,
      totalCustomers: filteredCustomers.length
    };
  }, [filteredJobs, filteredUsers, filteredCustomers]);

  return {
    jobs: filteredJobs,
    users: filteredUsers,
    customers: filteredCustomers,
    notifications: filteredNotifications,
    stats,
    currentUser
  };
}
