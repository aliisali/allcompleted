import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, MapPin, User, DollarSign, Camera, FileText, CheckCircle, Clock, XCircle, X, Trash2, ClipboardList, CreditCard as Edit, Play, Eye, Settings } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { CreateJobModal } from './CreateJobModal';
import { JobWorkflow } from './JobWorkflow';
import { JobDetailsModal } from './JobDetailsModal';

export function JobManagement() {
  const { jobs, addJob, deleteJob, updateJob, customers, users } = useData();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [editingMeasurements, setEditingMeasurements] = useState<any[]>([]);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerMobile: '',
    customerAddress: '',
    customerPostcode: '',
    scheduledDate: '',
    quotation: ''
  });

  // Filter jobs based on user role and permissions
  const getVisibleJobs = () => {
    if (currentUser?.role === 'admin') {
      return jobs; // Admin can see all jobs
    } else if (currentUser?.role === 'business') {
      return jobs.filter(job => job.businessId === currentUser.businessId); // Business can see jobs in their business
    } else if (currentUser?.role === 'employee') {
      return jobs.filter(job => 
        job.businessId === currentUser.businessId || 
        job.employeeId === currentUser.id
      ); // Employee can see jobs in their business or assigned to them
    }
    return [];
  };

  const visibleJobs = getVisibleJobs();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'tbd': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'awaiting-deposit': return <DollarSign className="w-5 h-5 text-purple-500" />;
      case 'awaiting-payment': return <DollarSign className="w-5 h-5 text-red-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'tbd': return 'bg-orange-100 text-orange-800';
      case 'awaiting-deposit': return 'bg-purple-100 text-purple-800';
      case 'awaiting-payment': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJobs = visibleJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    // First create or find customer
    const customerId = `customer-${Date.now()}`;
    const customerData = {
      name: newJob.customerName,
      email: newJob.customerEmail,
      phone: newJob.customerPhone,
      mobile: newJob.customerMobile,
      address: newJob.customerAddress,
      postcode: newJob.customerPostcode,
      businessId: currentUser?.businessId || 'business-1'
    };
    
    // Add customer to context (you'd need to import addCustomer from useData)
    
    const jobData = {
      ...newJob,
      customerId: customerId,
      jobType: 'installation' as const,
      status: 'pending' as const,
      employeeId: 'employee-1',
      businessId: 'business-1',
      scheduledTime: '09:00',
      quotation: parseFloat(newJob.quotation) || 0,
      images: [],
      documents: [],
      checklist: [
        { id: '1', text: 'Initial assessment', completed: false },
        { id: '2', text: 'Prepare materials', completed: false },
        { id: '3', text: 'Complete work', completed: false },
        { id: '4', text: 'Final inspection', completed: false },
      ],
      jobHistory: []
    };
    
    addJob(jobData);
    
    setShowCreateModal(false);
    setNewJob({
      title: '',
      description: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerMobile: '',
      customerAddress: '',
      customerPostcode: '',
      scheduledDate: '',
      quotation: ''
    });
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setNewJob({
      ...newJob,
      title: job.title,
      description: job.description,
      scheduledDate: job.scheduledDate.slice(0, 16),
      quotation: job.quotation?.toString() || ''
    });
  };

  const handleUpdateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingJob) {
      const updatedJobData = {
        ...newJob,
        quotation: parseFloat(newJob.quotation) || 0,
      };
      
      updateJob(editingJob.id, updatedJobData);
      
      setEditingJob(null);
      setNewJob({
        title: '',
        description: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerMobile: '',
        customerAddress: '',
        customerPostcode: '',
        scheduledDate: '',
        quotation: ''
      });
    }
  };

  const canEditJob = (job: any) => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'business' && job.businessId === currentUser.businessId) return true;
    if (currentUser?.role === 'employee' && (job.employeeId === currentUser.id || job.businessId === currentUser.businessId)) return true;
    return false;
  };

  const canDeleteJob = (job: any) => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'business' && job.businessId === currentUser.businessId) return true;
    return false;
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all jobs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Job
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="tbd">TBD</option>
                <option value="awaiting-deposit">Awaiting Deposit</option>
                <option value="awaiting-payment">Awaiting Payment</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className="text-sm text-blue-600 font-medium">
                      {job.jobType === 'measurement' ? '📏 Measurement' : '🔧 Installation'} Job
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                    {job.status.replace('-', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{job.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime || '09:00'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    {job.employeeId ? `Employee: ${job.employeeId}` : 'Unassigned'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${job.quotation?.toLocaleString() || 'TBD'}
                  </div>
                </div>

                {/* Customer Reference */}
                {job.customerReference && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Customer Reference:</strong> {job.customerReference}
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((job.checklist.filter(item => item.completed).length / job.checklist.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(job.checklist.filter(item => item.completed).length / job.checklist.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {(job.status === 'pending' || job.status === 'confirmed' || job.status === 'in-progress' || job.status === 'tbd') && (
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowWorkflow(true);
                      }}
                      className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {job.status === 'in-progress' ? 'Continue' : 'Start Job'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowDetailsModal(true);
                    }}
                    className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Details
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setShowJobDetails(true);
                    }}
                    className="flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    History
                  </button>
                  {canEditJob(job) && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setEditingJob(job);
                          setEditingMeasurements(job.measurements || []);
                          setShowEditModal(true);
                        }}
                        className="flex items-center px-3 py-1 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowAssignModal(true);
                        }}
                        className="flex items-center px-3 py-1 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Assign
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowPhotosModal(true);
                    }}
                    className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Photos ({job.images.length})
                  </button>
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowLocationModal(true);
                    }}
                    className="flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                  </button>
                  {canDeleteJob(job) && (
                    <button 
                      onClick={() => deleteJob(job.id)}
                      className="flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-2">Job ID</p>
                <p className="font-mono text-lg font-semibold text-gray-900">{job.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No jobs found matching your criteria</p>
        </div>
      )}

      
      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onJobCreated={() => {
          // Refresh jobs list
          window.location.reload();
        }}
      />

      {/* Job Workflow Modal */}
      {showWorkflow && selectedJob && (
        <JobWorkflow
          job={selectedJob}
          onUpdateJob={(updates) => {
            updateJob(selectedJob.id, updates);
            setSelectedJob({ ...selectedJob, ...updates });
          }}
          onClose={() => {
            setShowWorkflow(false);
            setSelectedJob(null);
          }}
        />
      )}

      {/* Job Details Modal (History) */}
      {showJobDetails && selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => {
            setShowJobDetails(false);
            setSelectedJob(null);
          }}
        />
      )}

      {/* Job Details Modal (Full Details) */}
      {showDetailsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Job Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedJob(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Job Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Job Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Job ID</p>
                    <p className="font-mono font-semibold">{selectedJob.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Title</p>
                    <p className="font-semibold">{selectedJob.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Type</p>
                    <p className="font-semibold">{selectedJob.jobType === 'measurement' ? 'Measurement' : 'Installation'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Status</p>
                    <p className="font-semibold capitalize">{selectedJob.status.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Scheduled Date</p>
                    <p className="font-semibold">{new Date(selectedJob.scheduledDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Time</p>
                    <p className="font-semibold">{selectedJob.scheduledTime || '09:00'}</p>
                  </div>
                </div>
                {selectedJob.description && (
                  <div className="mt-3">
                    <p className="text-sm text-blue-700">Description</p>
                    <p className="mt-1">{selectedJob.description}</p>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Customer ID</p>
                    <p className="font-semibold">{selectedJob.customerId}</p>
                  </div>
                  {selectedJob.customerReference && (
                    <div>
                      <p className="text-sm text-green-700">Reference</p>
                      <p className="font-semibold">{selectedJob.customerReference}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Measurements */}
              {selectedJob.measurements && selectedJob.measurements.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3">Measurements ({selectedJob.measurements.length})</h4>
                  <div className="space-y-2">
                    {selectedJob.measurements.map((m: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded">
                        <p className="font-semibold">Window {m.windowId}</p>
                        <p className="text-sm text-gray-600">{m.width} x {m.height} cm</p>
                        {m.location && <p className="text-sm text-gray-600">Location: {m.location}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {selectedJob.selectedProducts && selectedJob.selectedProducts.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-3">Selected Products</h4>
                  <div className="space-y-2">
                    {selectedJob.selectedProducts.map((p: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                        <span>{p.productName} x {p.quantity}</span>
                        <span className="font-semibold">${(p.price * p.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotation */}
              {selectedJob.quotation > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Quotation</h4>
                  <p className="text-2xl font-bold text-blue-600">${selectedJob.quotation.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Job</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingJob(null);
                  setSelectedJob(null);
                  setEditingMeasurements([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateJob(selectedJob.id, {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                scheduledDate: formData.get('scheduledDate') as string,
                scheduledTime: formData.get('scheduledTime') as string,
                measurements: editingMeasurements,
              });
              setShowEditModal(false);
              setEditingJob(null);
              setSelectedJob(null);
              setEditingMeasurements([]);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={selectedJob.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedJob.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    defaultValue={selectedJob.scheduledDate?.split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    name="scheduledTime"
                    defaultValue={selectedJob.scheduledTime || '09:00'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Measurements Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Measurements</label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMeasurements([...editingMeasurements, {
                        id: `measure-${Date.now()}`,
                        windowId: `W${editingMeasurements.length + 1}`,
                        width: '',
                        height: '',
                        location: ''
                      }]);
                    }}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    + Add Measurement
                  </button>
                </div>

                {editingMeasurements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No measurements added yet</p>
                ) : (
                  <div className="space-y-3">
                    {editingMeasurements.map((measurement, index) => (
                      <div key={measurement.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Window {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMeasurements(editingMeasurements.filter((_, i) => i !== index));
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Width (cm)</label>
                            <input
                              type="number"
                              value={measurement.width}
                              onChange={(e) => {
                                const updated = [...editingMeasurements];
                                updated[index].width = e.target.value;
                                setEditingMeasurements(updated);
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Width"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Height (cm)</label>
                            <input
                              type="number"
                              value={measurement.height}
                              onChange={(e) => {
                                const updated = [...editingMeasurements];
                                updated[index].height = e.target.value;
                                setEditingMeasurements(updated);
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Height"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Location</label>
                            <input
                              type="text"
                              value={measurement.location}
                              onChange={(e) => {
                                const updated = [...editingMeasurements];
                                updated[index].location = e.target.value;
                                setEditingMeasurements(updated);
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Location"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingJob(null);
                    setSelectedJob(null);
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Job Modal */}
      {showAssignModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Assign Job to Employee</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedJob(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const employeeId = formData.get('employeeId') as string;
              updateJob(selectedJob.id, {
                employeeId,
                jobHistory: [...selectedJob.jobHistory, {
                  id: `history-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  action: 'job_assigned',
                  description: `Job assigned to employee ${employeeId}`,
                  userId: currentUser?.id || '',
                  userName: currentUser?.name || ''
                }]
              });
              setShowAssignModal(false);
              setSelectedJob(null);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                <select
                  name="employeeId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  defaultValue={selectedJob.employeeId || ''}
                >
                  <option value="">-- Select Employee --</option>
                  {users.filter(u => u.role === 'employee' && u.businessId === currentUser?.businessId).map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedJob(null);
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photos Modal */}
      {showPhotosModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Job Photos</h3>
              <button
                onClick={() => {
                  setShowPhotosModal(false);
                  setSelectedJob(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedJob.images && selectedJob.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedJob.images.map((image: string, idx: number) => (
                    <div key={idx} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img src={image} alt={`Job photo ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No photos uploaded yet</p>
                  <p className="text-sm text-gray-500 mt-2">Photos will be added during the job workflow</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Job Location</h3>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setSelectedJob(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Customer Address</h4>
                    <p className="text-gray-900">
                      {(() => {
                        const customer = customers.find(c => c.id === selectedJob.customerId);
                        if (customer) {
                          return (
                            <>
                              {customer.address}
                              {customer.postcode && (
                                <>
                                  <br />
                                  {customer.postcode}
                                </>
                              )}
                            </>
                          );
                        }
                        return 'Customer address not available';
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Job Reference</p>
                <p className="font-mono font-semibold text-gray-900">{selectedJob.customerReference || selectedJob.id}</p>
              </div>

              {/* Add map placeholder */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Map view would display here</p>
                  <p className="text-sm text-gray-500">Integration with mapping service required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}