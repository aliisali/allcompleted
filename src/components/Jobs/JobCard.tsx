import React from 'react';
import { Calendar, MapPin, User, CheckCircle, Clock, XCircle, DollarSign, Play, Eye, Edit, Trash2 } from 'lucide-react';

interface JobCardProps {
  job: any;
  currentUser: any;
  onStartWorkflow: () => void;
  onShowDetails: () => void;
  onEdit: () => void;
  onAssign: () => void;
  onDelete: () => void;
  canDeleteJob: boolean;
  actionLoading: boolean;
}

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

const getStatusBadgeColor = (status: string) => {
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

export const JobCard = React.memo(function JobCard({
  job,
  currentUser,
  onStartWorkflow,
  onShowDetails,
  onEdit,
  onAssign,
  onDelete,
  canDeleteJob,
  actionLoading
}: JobCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            {getStatusIcon(job.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(job.status)}`}>
                {job.status.toUpperCase().replace('-', ' ')}
              </span>
            </div>
          </div>

          {job.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">{new Date(job.scheduledDate).toLocaleDateString()}</span>
            </div>
            {job.employeeId && (
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">Assigned</span>
              </div>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2 mt-4">
            {(job.status === 'pending' || job.status === 'confirmed' || job.status === 'in-progress' || job.status === 'tbd') && (
              <button
                onClick={onStartWorkflow}
                className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors cursor-pointer font-medium"
              >
                <Play className="w-4 h-4 mr-1" />
                {job.status === 'in-progress' ? 'Continue' : 'Start Job'}
              </button>
            )}
            <button
              onClick={onShowDetails}
              className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </button>
            {currentUser?.role !== 'employee' && (
              <>
                <button
                  onClick={onEdit}
                  className="flex items-center px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={onAssign}
                  className="flex items-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 mr-1" />
                  Assign
                </button>
              </>
            )}
            {canDeleteJob && (
              <button
                onClick={onDelete}
                disabled={actionLoading}
                className="flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>

        <div className="ml-4 flex-shrink-0 text-right">
          <p className="font-mono text-lg font-semibold text-gray-900">{job.id}</p>
        </div>
      </div>
    </div>
  );
});
