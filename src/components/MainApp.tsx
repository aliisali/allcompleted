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

export function MainApp() {
  const { user } = useAuth();
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
        case '3d-viewer': return <Model3DViewer />;
        case 'job-assignment': return <JobAssignmentCenter />;
        default: return <BusinessDashboard />;
      }
    }

    // Employee-specific features
    if (user?.role === 'employee') {
      switch (activeTab) {
        case 'dashboard': return <EmployeeDashboard />;
        case 'jobs': return <JobManagement />;
        case 'calendar': return <CalendarView />;
        case 'tasks': return <TaskManagement />;
        case 'camera': return <CameraCapture />;
        case 'ar-camera': return <ARCameraModule />;
        case 'emails': return <EmailCenter />;
        case 'notifications': return <NotificationCenter />;
        case 'products': return <ProductVisualizer />;
        case '3d-viewer': return <Model3DViewer />;
        case 'working-hours': return <WorkingHoursManager />;
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
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 transition-all duration-300 w-full">
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

          {renderContent()}
        </main>
      </div>
    </div>
  );
}