import React, { useState } from 'react';
import { Plus, Ruler, Save, ArrowRight, Trash2, Edit, X, Copy, Camera } from 'lucide-react';
import { Job, JobMeasurement } from '../../types';

interface MeasurementScreenProps {
  job: Job;
  onComplete: (data: { measurements: JobMeasurement[] }) => void;
}

export function MeasurementScreen({ job, onComplete }: MeasurementScreenProps) {
  const [measurements, setMeasurements] = useState<JobMeasurement[]>(job.measurements || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showARCamera, setShowARCamera] = useState(false);
  const [arImageUrl, setArImageUrl] = useState<string | null>(null);
  const [newMeasurement, setNewMeasurement] = useState({
    windowId: '',
    width: '',
    height: '',
    notes: '',
    location: '',
    controlType: 'none' as 'chain-cord' | 'wand' | 'none',
    bracketType: 'top-fix' as 'top-fix' | 'face-fix'
  });

  const handleAddMeasurement = () => {
    if (!newMeasurement.windowId || !newMeasurement.width || !newMeasurement.height) {
      alert('Please fill in Window ID, Width, and Height');
      return;
    }

    const measurement: JobMeasurement = {
      id: `measurement-${Date.now()}`,
      windowId: newMeasurement.windowId,
      width: parseFloat(newMeasurement.width),
      height: parseFloat(newMeasurement.height),
      notes: newMeasurement.notes,
      location: newMeasurement.location,
      controlType: newMeasurement.controlType,
      bracketType: newMeasurement.bracketType,
      createdAt: new Date().toISOString()
    };

    setMeasurements(prev => [...prev, measurement]);
    setNewMeasurement({
      windowId: '',
      width: '',
      height: '',
      notes: '',
      location: '',
      controlType: 'none',
      bracketType: 'top-fix'
    });
  };

  const handleDuplicateMeasurement = (measurement: JobMeasurement) => {
    const duplicated: JobMeasurement = {
      ...measurement,
      id: `measurement-${Date.now()}`,
      windowId: `${measurement.windowId}-copy`,
      createdAt: new Date().toISOString()
    };
    setMeasurements(prev => [...prev, duplicated]);
  };

  const handleDeleteMeasurement = (id: string) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      setMeasurements(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleEditMeasurement = (measurement: JobMeasurement) => {
    setEditingId(measurement.id);
    setNewMeasurement({
      windowId: measurement.windowId,
      width: measurement.width.toString(),
      height: measurement.height.toString(),
      notes: measurement.notes || '',
      location: measurement.location || '',
      controlType: measurement.controlType || 'none',
      bracketType: measurement.bracketType || 'top-fix'
    });
  };

  const handleUpdateMeasurement = () => {
    if (!newMeasurement.windowId || !newMeasurement.width || !newMeasurement.height) {
      alert('Please fill in all required fields');
      return;
    }

    setMeasurements(prev => prev.map(m =>
      m.id === editingId ? {
        ...m,
        windowId: newMeasurement.windowId,
        width: parseFloat(newMeasurement.width),
        height: parseFloat(newMeasurement.height),
        notes: newMeasurement.notes,
        location: newMeasurement.location,
        controlType: newMeasurement.controlType,
        bracketType: newMeasurement.bracketType
      } : m
    ));

    setEditingId(null);
    setNewMeasurement({
      windowId: '',
      width: '',
      height: '',
      notes: '',
      location: '',
      controlType: 'none',
      bracketType: 'top-fix'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewMeasurement({
      windowId: '',
      width: '',
      height: '',
      notes: '',
      location: '',
      controlType: 'none',
      bracketType: 'top-fix'
    });
  };

  const handleComplete = () => {
    if (measurements.length === 0) {
      alert('Please add at least one measurement');
      return;
    }
    onComplete({ measurements });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Window Measurements</h3>
        <p className="text-gray-600">Take accurate measurements for each window</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <p className="text-sm text-blue-600">Add as many measurements as needed</p>
          <button
            onClick={() => setShowARCamera(true)}
            className="flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Camera className="w-4 h-4 mr-1.5" />
            Use AR Camera
          </button>
        </div>
      </div>

      {/* Add/Edit Measurement */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-blue-900">{editingId ? 'Edit Measurement' : 'Add New Measurement'}</h4>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
              title="Cancel editing"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Window ID *
            </label>
            <input
              type="text"
              value={newMeasurement.windowId}
              onChange={(e) => setNewMeasurement({...newMeasurement, windowId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="W1, W2, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={newMeasurement.width}
              onChange={(e) => setNewMeasurement({...newMeasurement, width: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="120.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={newMeasurement.height}
              onChange={(e) => setNewMeasurement({...newMeasurement, height: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="150.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={newMeasurement.location}
              onChange={(e) => setNewMeasurement({...newMeasurement, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Living room, bedroom, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Control Type
            </label>
            <select
              value={newMeasurement.controlType}
              onChange={(e) => setNewMeasurement({...newMeasurement, controlType: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">None</option>
              <option value="chain-cord">Chain & Cord Control</option>
              <option value="wand">Wand Control</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bracket Type
            </label>
            <select
              value={newMeasurement.bracketType}
              onChange={(e) => setNewMeasurement({...newMeasurement, bracketType: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="top-fix">T - Top Fix</option>
              <option value="face-fix">F - Face Fix</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={newMeasurement.notes}
              onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Special requirements, obstacles, etc."
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={editingId ? handleUpdateMeasurement : handleAddMeasurement}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingId ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Measurement
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Measurement
              </>
            )}
          </button>
        </div>
      </div>

      {/* Measurements List */}
      {measurements.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Recorded Measurements ({measurements.length})</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {measurements.map(measurement => (
              <div key={measurement.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {measurement.location && (
                      <p className="text-lg font-bold text-gray-900 mb-2">{measurement.location}</p>
                    )}
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Ruler className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Window {measurement.windowId}</p>
                        <p className="text-sm text-gray-600">
                          {measurement.width} × {measurement.height} cm
                        </p>
                        <div className="flex gap-2 mt-1">
                          {measurement.controlType && measurement.controlType !== 'none' && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              {measurement.controlType === 'chain-cord' ? 'Chain & Cord' : 'Wand'}
                            </span>
                          )}
                          {measurement.bracketType && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {measurement.bracketType === 'top-fix' ? 'T - Top Fix' : 'F - Face Fix'}
                            </span>
                          )}
                        </div>
                        {measurement.notes && (
                          <p className="text-sm text-gray-500 italic mt-1">{measurement.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDuplicateMeasurement(measurement)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Duplicate this measurement"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditMeasurement(measurement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit this measurement"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeasurement(measurement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete this measurement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AR Camera Modal */}
      {showARCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AR Measurement Assistant</h3>
              <button
                onClick={() => setShowARCamera(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10">
                  <Camera className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">AR Camera View</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Point camera at window to measure dimensions
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        const fakeImageUrl = `https://via.placeholder.com/800x600/6366f1/ffffff?text=AR+Measurement+${Date.now()}`;
                        setArImageUrl(fakeImageUrl);
                        alert('AR measurement captured! This would use device AR capabilities.');
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Camera className="w-4 h-4 mr-2 inline" />
                      Capture Measurement
                    </button>
                    <button
                      onClick={() => {
                        alert('Auto-detect would use AR to automatically measure window dimensions');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Ruler className="w-4 h-4 mr-2 inline" />
                      Auto-Detect Dimensions
                    </button>
                  </div>
                </div>

                {/* AR Overlay Grid */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                  {/* AR Measurement Indicators */}
                  <div className="absolute top-1/2 left-1/4 w-1/2 border-2 border-purple-500 rounded-lg">
                    <div className="absolute -top-6 left-0 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      Width: 120cm
                    </div>
                  </div>
                  <div className="absolute top-1/4 left-1/2 h-1/2 border-2 border-purple-500 rounded-lg">
                    <div className="absolute -left-16 top-0 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      Height: 150cm
                    </div>
                  </div>
                </div>
              </div>

              {arImageUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">✓ AR Measurement Captured</p>
                  <p className="text-sm text-green-700">Image reference saved for this measurement</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">AR Measurement Features:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Point camera at window frame to auto-detect dimensions</li>
                  <li>• Real-time measurement display with AR overlay</li>
                  <li>• Capture reference photos with measurements</li>
                  <li>• Automatic conversion to centimeters</li>
                  <li>• Visual guides for accurate measurement</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowARCamera(false);
                    setArImageUrl(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (arImageUrl) {
                      alert('AR measurements would be automatically added to the form');
                      setShowARCamera(false);
                    } else {
                      alert('Please capture a measurement first');
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Apply to Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={measurements.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save and continue to next step"
        >
          Save Measurements & Continue
          <ArrowRight className="w-4 h-4 ml-2 inline" />
        </button>
      </div>
    </div>
  );
}
