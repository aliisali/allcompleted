import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleBasedData } from '../../hooks/useRoleBasedData';
import {
  ClipboardList,
  Calendar,
  CheckCircle,
  Clock,
  Camera,
  FileText,
  Bell,
  MapPin
} from 'lucide-react';
import { LoadingSpinner } from '../Layout/LoadingSpinner';

export function EmployeeDashboard() {
  const { refreshData, markNotificationRead, deleteNotification, loading } = useData();
  const { user: currentUser } = useAuth();
  // Use role-based data filtering for proper data isolation
  const { jobs, notifications, customers } = useRoleBasedData();
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [expandedNotifications, setExpandedNotifications] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | '6month'>('week');
  const [installationFilter, setInstallationFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [showMap, setShowMap] = useState(false);
  const [mapJobLocation, setMapJobLocation] = useState<any>(null);

  // Auto-refresh jobs every 30 seconds to check for new assignments
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing employee jobs...');
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  // Jobs are already filtered by useRoleBasedData hook
  console.log('📋 Employee jobs (role-filtered):', jobs.length);

  // Filter jobs by time period
  const getFilteredJobsByTime = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    return jobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      switch (timeFilter) {
        case 'week':
          return jobDate >= weekAgo;
        case 'month':
          return jobDate >= monthAgo;
        case '6month':
          return jobDate >= sixMonthsAgo;
        default:
          return true;
      }
    });
  };

  const filteredJobs = getFilteredJobsByTime();

  // Filter by installation status
  const getJobsByInstallationStatus = () => {
    switch (installationFilter) {
      case 'completed':
        return filteredJobs.filter(job => job.status === 'completed');
      case 'pending':
        return filteredJobs.filter(job => job.status !== 'completed');
      default:
        return filteredJobs;
    }
  };

  const displayJobs = getJobsByInstallationStatus();
  const todayJobs = displayJobs.slice(0, 3);
  const completedToday = todayJobs.filter(job => job.status === 'completed').length;
  const pendingToday = todayJobs.filter(job => job.status === 'pending').length;
  
  const todayStats = [
    { label: 'Today\'s Installs', value: todayJobs.length.toString(), icon: ClipboardList, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { label: 'Completed', value: completedToday.toString(), icon: CheckCircle, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { label: 'Pending', value: pendingToday.toString(), icon: Clock, color: 'bg-gradient-to-r from-amber-500 to-amber-600' },
    { label: 'Photos Taken', value: '12', icon: Camera, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  ];

  // Transform jobs data for display
  const todayJobsDisplay = todayJobs.map(job => ({
    id: job.id,
    customer: customers.find(c => c.id === job.customerId)?.name || 'Unknown Customer',
    address: '123 Main St, City', // Simplified for demo
    time: new Date(job.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: job.status,
    type: job.title
  }));

  // Get notifications
  const displayNotifications = expandedNotifications ? notifications : notifications.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Installation Dashboard</h1>
            <p className="text-gray-600 mt-2">Your daily blinds installation tasks and schedule</p>
          </div>
          <button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              refreshData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Jobs</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Time Period:</label>
              <div className="flex space-x-1">
                {[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: '6month', label: '6 Months' }].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTimeFilter(opt.value as any)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      timeFilter === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <div className="flex space-x-1">
                {[{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setInstallationFilter(opt.value as any)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      installationFilter === opt.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            Showing {displayJobs.length} job(s) | {displayJobs.filter(j => j.status === 'completed').length} completed, {displayJobs.filter(j => j.status !== 'completed').length} pending
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading dashboard..." />}

      {/* Today's Stats */}
      {!loading && (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-6">
        {/* Today's Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Installations</h2>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No jobs assigned yet</p>
              <p className="text-sm text-gray-500 mt-2">Jobs will appear here once your manager assigns them to you</p>
              <button
                onClick={() => refreshData()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check for New Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
            {todayJobsDisplay.map((job, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="font-medium text-gray-900">{job.id}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                        {job.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{job.customer}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMapJobLocation(job);
                          setShowMap(true);
                        }}
                        className="flex items-center hover:text-blue-600 transition-colors"
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.address}
                      </button>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">{job.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{job.time}</p>
                    <button
                      onClick={() => {
                        const fullJob = jobs.find(j => j.id === job.id);
                        setSelectedJob(fullJob);
                        setShowJobDetails(true);
                      }}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Notifications
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({notifications.length})
              </span>
            </h2>
            <button
              onClick={() => setExpandedNotifications(!expandedNotifications)}
              className="text-blue-600 hover:text-blue-700 transition-colors relative"
              title="Toggle notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
          <div className={`space-y-3 transition-all duration-300 ${
            expandedNotifications ? 'max-h-[500px] overflow-y-auto' : 'max-h-[300px]'
          }`}>
            {displayNotifications.length > 0 ? (
              displayNotifications.map((notification) => {
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer group relative ${
                      !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markNotificationRead(notification.id);
                      }
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.type === 'job' ? 'bg-blue-500' :
                      notification.type === 'reminder' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 flex-shrink-0"
                      title="Dismiss"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
            )}
          </div>
          {notifications.length > 3 && (
            <button
              onClick={() => setExpandedNotifications(!expandedNotifications)}
              className="w-full mt-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              {expandedNotifications ? 'Show Less' : `Show All (${notifications.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Job Details</h3>
              <button
                onClick={() => {
                  setShowJobDetails(false);
                  setSelectedJob(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job ID</label>
                <p className="text-gray-900 font-mono">{selectedJob.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="text-gray-900">{selectedJob.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedJob.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedJob.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedJob.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    selectedJob.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedJob.status.replace('-', ' ')}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                  <p className="text-gray-900">{new Date(selectedJob.scheduledDate).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="text-gray-900">{customers.find(c => c.id === selectedJob.customerId)?.name || 'Unknown'}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowJobDetails(false);
                  setSelectedJob(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMap && mapJobLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Job Location</h3>
              <button
                onClick={() => {
                  setShowMap(false);
                  setMapJobLocation(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Job Address</h4>
                    <p className="text-gray-900">{mapJobLocation.address}</p>
                    <p className="text-sm text-gray-600 mt-1">Job ID: {mapJobLocation.id}</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center relative">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">Interactive Map</p>
                  <p className="text-sm text-gray-500 mt-1">Map integration will display here</p>
                  <p className="text-xs text-gray-400 mt-2">Showing: {mapJobLocation.address}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapJobLocation.address)}`, '_blank');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open in Google Maps
                </button>
                <button
                  onClick={() => {
                    setShowMap(false);
                    setMapJobLocation(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}