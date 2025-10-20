import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Layout/Sidebar';
import { AdminDashboard } from './Dashboard/AdminDashboard';
import { BusinessDashboard } from './Dashboard/BusinessDashboard';
import { EmployeeDashboard } from './Dashboard/EmployeeDashboard';
import { UserManagement } from './Users/UserManagement';
import { JobManagement } from './Jobs/JobManagement';
import { CalendarView } from './Calendar/CalendarView';
import { TaskManagement } from './Tasks/TaskManagement';
import { CameraCapture } from './Camera/CameraCapture';
import { EmailCenter } from './Email/EmailCenter';
import { NotificationCenter } from './Notifications/NotificationCenter';
import { ProductVisualizer } from './Features/ProductVisualizer';
import { BusinessManagement } from './Business/BusinessManagement';
import { PermissionManagement } from './Permissions/PermissionManagement';
import { ReportsManagement } from './Reports/ReportsManagement';
import { ProductManagement } from './Products/ProductManagement';
import { CustomerManagement } from './Customers/CustomerManagement';
import ARCameraModule from './ARModule/ARCameraModule';
import ARCameraV2 from './ARModule/ARCameraV2';
import { ModulePermissions } from './Admin/ModulePermissions';
import { AdminHTMLManager } from './Admin/AdminHTMLManager';
import { ModelConverter } from './Admin/ModelConverter';
import New3DConverter from './Admin/New3DConverter';
import { ModelPermissions } from './Admin/ModelPermissions';
import { Model3DViewer } from './Features/Model3DViewer';
import { EmailManager } from './Admin/EmailManager';
import PermissionManagementWrapper from './Permissions/PermissionManagement';
import { BusinessSettingsManager } from './Admin/BusinessSettings';
import { JobAssignmentCenter } from './Business/JobAssignment';
import { WorkingHoursManager } from './Employee/WorkingHours';
import { SubscriptionManagement } from './Admin/SubscriptionManagement';
import { SubscriptionPage } from './Business/SubscriptionPage';
import { SubscriptionBanner } from './Layout/SubscriptionBanner';
import { BackgroundRemoverManager } from './Admin/BackgroundRemoverManager';

export function MainApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    // Admin-specific features
    if (user?.role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard />;
        case 'users': return <UserManagement />;
        case 'businesses': return <BusinessManagement />;
        case 'ar-camera': return <ARCameraModule />;
        case 'ar-camera-v2': return <ARCameraV2 />;
        case 'permissions': return <PermissionManagementWrapper />;
        case 'reports': return <ReportsManagement />;
        case 'products': return <ProductManagement />;
        case 'html-manager': return <AdminHTMLManager />;
        case 'module-permissions': return <ModulePermissions />;
        case 'new-3d-converter': return <New3DConverter />;
        case 'model-converter': return <ModelConverter />;
        case 'model-permissions': return <ModelPermissions />;
        case 'email-manager': return <EmailManager />;
        case 'business-settings': return <BusinessSettingsManager />;
        case 'subscriptions': return <SubscriptionManagement />;
        case 'background-remover': return <BackgroundRemoverManager />;
        default: return <AdminDashboard />;
      }
    }

    // Business-specific features
    if (user?.role === 'business') {
      switch (activeTab) {
        case 'dashboard': return <BusinessDashboard />;
        case 'employees': return <UserManagement />;
        case 'jobs': return <JobManagement />;
        case 'calendar': return <CalendarView />;
        case 'reports': return <ReportsManagement />;
        case 'customers': return <CustomerManagement />;
        case 'subscription': return <SubscriptionPage />;
        case 'ar-camera': return <ARCameraModule />;
        case 'job-assignment': return <JobAssignmentCenter />;
        case 'products': return <ProductVisualizer />;
        default: return <BusinessDashboard />;
      }
    }

    // Employee-specific features
    if (user?.role === 'employee') {
      switch (activeTab) {
        case 'dashboard': return <EmployeeDashboard />;
        case 'jobs': return <JobManagement />;
        case 'calendar': return <CalendarView />;
        case 'emails': return <EmailCenter />;
        case 'notifications': return <NotificationCenter />;
        case 'products': return <ProductVisualizer />;
        case 'account': return <WorkingHoursManager />;
        default: return <EmployeeDashboard />;
      }
    }

    // Common components for all roles (fallback)
    if (activeTab === 'jobs') {
      return <JobManagement />;
    }
    if (activeTab === 'products') {
      return <ProductVisualizer />;
    }

    // Default fallback
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <p className="text-gray-600">
            Feature not available for your role.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <SubscriptionBanner onNavigateToSubscription={() => setActiveTab('subscription')} />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 transition-transform duration-300`}>
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }}
            isMinimized={sidebarMinimized}
          onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
        />
      </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 transition-all duration-300 w-full">
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="font-semibold text-gray-900">BlindsCloud</div>
            <div className="w-10"></div>
          </div>

          {/* Desktop Top Bar with Logout */}
          <div className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}