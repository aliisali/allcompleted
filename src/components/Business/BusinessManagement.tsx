import React, { useState } from 'react';
import { Plus, Search, Filter, CreditCard as Edit, Trash2, Building2, MapPin, Phone, Mail, Calendar, Users, Eye, Settings, X, Headphones } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function BusinessManagement() {
  const { businesses, addBusiness, deleteBusiness, updateBusiness } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    adminId: '',
    adminPassword: '',
    logo: ''
  });
  const [logoPreview, setLogoPreview] = useState<string>('');


  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const businessData = {
      name: newBusiness.name,
      address: newBusiness.address,
      phone: newBusiness.phone,
      email: newBusiness.email,
      adminId: newBusiness.adminId || '',
      logo: newBusiness.logo || '',
      features: ['job_management', 'calendar', 'reports'],
      subscription: 'basic' as const
    };
    
    await addBusiness(businessData);
    
    // Reset form
    setNewBusiness({
      name: '',
      address: '',
      phone: '',
      email: '',
      adminId: '',
      adminPassword: '',
      logo: ''
    });
    setLogoPreview('');
    
    setShowCreateModal(false);
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      await deleteBusiness(businessId);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-gray-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
          <p className="text-gray-600 mt-2">Manage registered businesses and their information</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Business
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Business Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((business) => (
          <div key={business.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                {business.logo ? (
                  <img src={business.logo} alt={`${business.name} logo`} className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                  title="Edit Business"
                >
                  <Edit className="w-4 h-4" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Edit Business
                  </span>
                </button>
                <button
                  onClick={() => {
                    setSelectedBusiness(business);
                    setShowFeaturesModal(true);
                  }}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors group relative"
                  title="Manage Features"
                >
                  <Settings className="w-4 h-4" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Manage Features
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteBusiness(business.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group relative"
                  title="Delete Business"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Delete Business
                  </span>
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{business.name}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{business.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{business.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Created {new Date(business.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span>12 employees</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  business.subscription === 'premium' ? 'bg-amber-100 text-amber-800' :
                  business.subscription === 'enterprise' ? 'bg-gold-100 text-gold-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {business.subscription}
                </span>
                {business.features.includes('vr_view') && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                    <Headphones className="w-3 h-3 mr-1" />
                    VR
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {business.features.length} features
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBusinesses.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No businesses found</p>
        </div>
      )}

      {/* Create Business Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Business</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBusiness.name}
                  onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newBusiness.address}
                  onChange={(e) => setNewBusiness({...newBusiness, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter complete address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newBusiness.phone}
                    onChange={(e) => setNewBusiness({...newBusiness, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newBusiness.email}
                    onChange={(e) => setNewBusiness({...newBusiness, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@business.com"
                  />
                </div>
              </div>

              {/* Admin User ID is auto-generated - hidden from user */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Admin Password *
                </label>
                <input
                  type="password"
                  required
                  value={newBusiness.adminPassword}
                  onChange={(e) => setNewBusiness({...newBusiness, adminPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter initial password"
                  minLength={8}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Password must be at least 8 characters. Admin can change this on first login.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Logo (Optional)
                </label>
                <div className="space-y-3">
                  {logoPreview && (
                    <div className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview('');
                          setNewBusiness({...newBusiness, logo: ''});
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          alert('Logo size should be less than 2MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          setNewBusiness({...newBusiness, logo: base64String});
                          setLogoPreview(base64String);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-600">
                    Upload a logo for this business (max 2MB, PNG, JPG, or SVG)
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Features Modal */}
      {showFeaturesModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Manage Features - {selectedBusiness.name}</h3>
              <button
                onClick={() => {
                  setShowFeaturesModal(false);
                  setSelectedBusiness(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Enable or disable features for this business. All employees of this business will inherit these features.
              </p>
              
              {[
                { id: 'job_management', name: 'Job Management', description: 'Create and manage jobs' },
                { id: 'calendar', name: 'Calendar', description: 'Schedule and view appointments' },
                { id: 'reports', name: 'Reports', description: 'Generate business reports' },
                { id: 'vr_view', name: 'VR View', description: 'Access VR/AR camera features' }
              ].map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{feature.name}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBusiness.features?.includes(feature.id) || false}
                      onChange={async (e) => {
                        const newFeatures = e.target.checked
                          ? [...(selectedBusiness.features || []), feature.id]
                          : (selectedBusiness.features || []).filter((f: string) => f !== feature.id);

                        try {
                          await updateBusiness(selectedBusiness.id, { features: newFeatures });
                          setSelectedBusiness({ ...selectedBusiness, features: newFeatures });
                        } catch (error) {
                          console.error('Error updating features:', error);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => {
                  setShowFeaturesModal(false);
                  setSelectedBusiness(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}