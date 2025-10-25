import React, { useState, useEffect } from 'react';
import { Clock, Save, User, Mail, Phone, MapPin, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { EmployeeWorkingHours } from '../../types';

export function WorkingHoursManager() {
  const { user } = useAuth();
  const [workingHours, setWorkingHours] = useState<EmployeeWorkingHours | null>(null);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [autoBookingEnabled, setAutoBookingEnabled] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      loadWorkingHours();
      loadAccountDetails();
      loadAutoBookingSetting();
    }
  }, [user]);

  const loadAccountDetails = () => {
    try {
      const stored = localStorage.getItem(`account_details_${user?.id}`);
      if (stored) {
        setAccountDetails(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading account details:', error);
    }
  };

  const loadAutoBookingSetting = () => {
    try {
      const stored = localStorage.getItem(`auto_booking_${user?.id}`);
      if (stored) {
        setAutoBookingEnabled(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading auto booking setting:', error);
    }
  };

  const toggleAutoBooking = () => {
    const newValue = !autoBookingEnabled;
    setAutoBookingEnabled(newValue);
    try {
      localStorage.setItem(`auto_booking_${user?.id}`, JSON.stringify(newValue));
      showSuccessMessage(newValue ? 'Auto-booking enabled!' : 'Auto-booking disabled!');
    } catch (error) {
      console.error('Error saving auto booking setting:', error);
    }
  };

  const saveAccountDetails = () => {
    try {
      localStorage.setItem(`account_details_${user?.id}`, JSON.stringify(accountDetails));
      setIsEditingAccount(false);
      showSuccessMessage('Account details saved successfully!');
    } catch (error) {
      console.error('Error saving account details:', error);
    }
  };

  const loadWorkingHours = () => {
    try {
      const stored = localStorage.getItem(`working_hours_${user?.id}`);
      if (stored) {
        setWorkingHours(JSON.parse(stored));
      } else {
        // Create default working hours
        const defaultHours: EmployeeWorkingHours = {
          userId: user?.id || '',
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '13:00', available: false },
          sunday: { start: '09:00', end: '13:00', available: false }
        };
        setWorkingHours(defaultHours);
      }
    } catch (error) {
      console.error('Error loading working hours:', error);
    }
  };

  const saveWorkingHours = () => {
    if (workingHours) {
      try {
        localStorage.setItem(`working_hours_${user?.id}`, JSON.stringify(workingHours));
        showSuccessMessage('Working hours saved successfully!');
      } catch (error) {
        console.error('Error saving working hours:', error);
      }
    }
  };

  const updateDayHours = (day: keyof Omit<EmployeeWorkingHours, 'userId'>, field: 'start' | 'end' | 'available', value: string | boolean) => {
    if (workingHours) {
      setWorkingHours({
        ...workingHours,
        [day]: {
          ...workingHours[day],
          [field]: value
        }
      });
    }
  };

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

  if (!workingHours) {
    return <div>Loading...</div>;
  }

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ] as const;

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600 mt-2">Manage your account details and working hours</p>
      </div>

      {/* Account Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>
          {!isEditingAccount ? (
            <button
              onClick={() => setIsEditingAccount(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Details
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={saveAccountDetails}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingAccount(false);
                  loadAccountDetails();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            {isEditingAccount ? (
              <input
                type="text"
                value={accountDetails.name}
                onChange={(e) => setAccountDetails({ ...accountDetails, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{accountDetails.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            {isEditingAccount ? (
              <input
                type="email"
                value={accountDetails.email}
                onChange={(e) => setAccountDetails({ ...accountDetails, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{accountDetails.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            {isEditingAccount ? (
              <input
                type="tel"
                value={accountDetails.phone}
                onChange={(e) => setAccountDetails({ ...accountDetails, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{accountDetails.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            {isEditingAccount ? (
              <input
                type="text"
                value={accountDetails.address}
                onChange={(e) => setAccountDetails({ ...accountDetails, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter address"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{accountDetails.address || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Working Hours Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            <Clock className="w-5 h-5 inline mr-2" />
            Working Hours
          </h2>
          <button
            onClick={saveWorkingHours}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Hours
          </button>
        </div>
        <div className="space-y-4">
          {days.map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-24">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={workingHours[key].available}
                    onChange={(e) => updateDayHours(key, 'available', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="font-medium text-gray-900">{label}</span>
                </label>
              </div>

              {workingHours[key].available ? (
                <div className="flex items-center space-x-4 flex-1">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={workingHours[key].start}
                      onChange={(e) => updateDayHours(key, 'start', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={workingHours[key].end}
                      onChange={(e) => updateDayHours(key, 'end', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1 text-sm text-gray-600">
                    Available: {workingHours[key].start} - {workingHours[key].end}
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-sm text-gray-500 italic">
                  Not available
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">Automatic Job Assignment</h4>
              <p className="text-blue-800 text-sm mb-3">
                When automatic booking is enabled, jobs will only be assigned to you during your available hours.
                Make sure to keep your working hours updated for accurate job assignment.
              </p>
            </div>
            <div className="ml-4">
              <button
                onClick={toggleAutoBooking}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  autoBookingEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    autoBookingEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              autoBookingEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              autoBookingEnabled ? 'text-green-800' : 'text-gray-600'
            }`}>
              {autoBookingEnabled ? 'Auto-booking is ENABLED' : 'Auto-booking is DISABLED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}