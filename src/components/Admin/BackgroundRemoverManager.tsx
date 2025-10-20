import React, { useState, useEffect } from 'react';
import { Wand2, Building2, Users, Search, Check, X, Shield, AlertCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { supabase } from '../../lib/supabase';

interface BusinessPermission {
  id: string;
  name: string;
  bgRemoverEnabled: boolean;
  employeeCount: number;
}

export function BackgroundRemoverManager() {
  const { users, businesses } = useData();
  const [businessPermissions, setBusinessPermissions] = useState<BusinessPermission[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBusinessPermissions();
  }, [businesses, users]);

  const loadBusinessPermissions = () => {
    const permissions = businesses.map(business => {
      const employeeCount = users.filter(u => u.businessId === business.id).length;
      return {
        id: business.id,
        name: business.name,
        bgRemoverEnabled: business.bgRemoverEnabled || false,
        employeeCount
      };
    });
    setBusinessPermissions(permissions);
  };

  const toggleBusinessPermission = async (businessId: string) => {
    setLoading(true);
    try {
      const business = businessPermissions.find(b => b.id === businessId);
      const newStatus = !business?.bgRemoverEnabled;

      const { error } = await supabase
        .from('businesses')
        .update({ bg_remover_enabled: newStatus })
        .eq('id', businessId);

      if (error) throw error;

      setBusinessPermissions(prev =>
        prev.map(b =>
          b.id === businessId ? { ...b, bgRemoverEnabled: newStatus } : b
        )
      );

      showSuccessMessage(
        `Background remover ${newStatus ? 'enabled' : 'disabled'} for ${business?.name}`
      );
    } catch (error) {
      console.error('Failed to update business permission:', error);
      showErrorMessage('Failed to update permission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const grantEmployeeAccess = async (employeeId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('module_permissions')
        .upsert({
          user_id: employeeId,
          module_id: 'background_remover',
          can_access: true,
          can_grant_access: false,
          granted_by: 'current-admin-id',
          granted_at: new Date().toISOString()
        });

      if (error) throw error;

      const employee = users.find(u => u.id === employeeId);
      showSuccessMessage(`Access granted to ${employee?.name}`);
    } catch (error) {
      console.error('Failed to grant employee access:', error);
      showErrorMessage('Failed to grant access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const revokeEmployeeAccess = async (employeeId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('module_permissions')
        .delete()
        .eq('user_id', employeeId)
        .eq('module_id', 'background_remover');

      if (error) throw error;

      const employee = users.find(u => u.id === employeeId);
      showSuccessMessage(`Access revoked from ${employee?.name}`);
    } catch (error) {
      console.error('Failed to revoke employee access:', error);
      showErrorMessage('Failed to revoke access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businessPermissions.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBusiness = businessPermissions.find(b => b.id === selectedBusinessId);
  const businessEmployees = selectedBusinessId
    ? users.filter(u => u.businessId === selectedBusinessId && u.role === 'employee')
    : [];

  const showSuccessMessage = (message: string) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 3000);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wand2 className="w-8 h-8 mr-3 text-purple-600" />
            Background Remover Access
          </h1>
          <p className="text-gray-600 mt-2">Manage AI background removal permissions for businesses and employees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Permissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Business Access
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-medium">Permission Hierarchy</p>
                <p className="mt-1">Admin enables for business → Business can enable for employees</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                  selectedBusinessId === business.id
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedBusinessId(business.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{business.name}</div>
                        <div className="text-sm text-gray-600">
                          {business.employeeCount} employee{business.employeeCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {business.bgRemoverEnabled ? (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Enabled</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Disabled</span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBusinessPermission(business.id);
                      }}
                      disabled={loading}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        business.bgRemoverEnabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {business.bgRemoverEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No businesses found</p>
            </div>
          )}
        </div>

        {/* Employee Permissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
            <Users className="w-5 h-5 mr-2" />
            Employee Access
            {selectedBusiness && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({selectedBusiness.name})
              </span>
            )}
          </h2>

          {!selectedBusinessId ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Select a business to manage employee access</p>
              <p className="text-sm text-gray-500">Choose a business from the left panel</p>
            </div>
          ) : !selectedBusiness?.bgRemoverEnabled ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <X className="w-16 h-16 text-red-400 mb-4" />
              <p className="text-gray-600 mb-2">Background remover is disabled for this business</p>
              <p className="text-sm text-gray-500">Enable it first to grant employee access</p>
            </div>
          ) : businessEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600">No employees in this business</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {businessEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-600">{employee.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => grantEmployeeAccess(employee.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm disabled:opacity-50"
                    >
                      Grant
                    </button>
                    <button
                      onClick={() => revokeEmployeeAccess(employee.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">1. Admin Controls</div>
            <p className="text-sm text-blue-800">
              As admin, you enable/disable the background remover feature for any business
            </p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">2. Business Access</div>
            <p className="text-sm text-purple-800">
              Once enabled for a business, they can grant access to their employees
            </p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="font-medium text-green-900 mb-2">3. Employee Usage</div>
            <p className="text-sm text-green-800">
              Employees with access can use AI background removal in AR camera
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
