import React, { useState, useEffect } from 'react';
import { Cuboid as Cube, RotateCcw, ZoomIn, ZoomOut, Move3d as Move3D, Eye, Download, Share2, Settings, Play, Pause } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThreeDScene } from './ThreeDScene';

interface Model3D {
  id: string;
  name: string;
  originalImage: string;
  model3D: string;
  thumbnail: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  fileSize?: number;
  settings: {
    depth: number;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    style: 'extrude' | 'relief' | 'full3d';
  };
}

export function Model3DViewer() {
  const { user } = useAuth();
  const [models, setModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [viewerSettings, setViewerSettings] = useState({
    autoRotate: true,
    showWireframe: false,
    backgroundColor: '#f0f0f0'
  });
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
    loadAvailableModels();

    const intervalId = setInterval(() => {
      loadAvailableModels();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [user]);

  const checkPermissions = () => {
    if (!user) return;

    // Check if user has permission to view 3D models
    if (user.role === 'admin') {
      setHasPermission(true);
      return;
    }

    // Check business permissions
    try {
      const modelPermissions = JSON.parse(localStorage.getItem('model_permissions_v1') || '[]');
      const businessPermission = modelPermissions.find(
        (p: any) => p.businessId === user.businessId
      );
      
      setHasPermission(businessPermission?.canView3DModels || false);
    } catch (error) {
      console.error('Error checking model permissions:', error);
      setHasPermission(false);
    }
  };

  const loadAvailableModels = () => {
    try {
      const stored = localStorage.getItem('admin_3d_models');
      console.log('Loading models from localStorage:', stored);
      const storedModels = stored ? JSON.parse(stored) : [];
      console.log('Parsed models:', storedModels);

      const completedModels = storedModels.filter((m: Model3D) => m.status === 'completed');
      console.log('Completed models:', completedModels);

      setModels(completedModels);
      if (completedModels.length > 0 && !selectedModel) {
        setSelectedModel(completedModels[0]);
      }
    } catch (error) {
      console.error('Error loading 3D models:', error);
      setModels([]);
    }
  };

  const downloadModel = (model: Model3D) => {
    // Create a mock download
    const link = document.createElement('a');
    link.href = model.model3D;
    link.download = `${model.name}.gltf`;
    link.click();
    
    showSuccessMessage('3D model download started!');
  };

  const shareModel = (model: Model3D) => {
    if (navigator.share) {
      navigator.share({
        title: model.name,
        text: `Check out this 3D model: ${model.name}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showSuccessMessage('Link copied to clipboard!');
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

  if (!hasPermission) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Cube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3D Model Viewer</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to view 3D models.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator to request access to 3D model viewing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">3D Model Viewer</h1>
          <p className="text-gray-600 mt-2">Interactive 3D rendering powered by CSS 3D transforms - Drag to rotate, scroll to zoom</p>
        </div>
        <button
          onClick={loadAvailableModels}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh ({models.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Model List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Models</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {models.length}
            </span>
          </div>
          {models.length > 0 ? (
            <div className="space-y-3">
              {models.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedModel?.id === model.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={model.thumbnail}
                      alt={model.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{model.name}</h3>
                      <p className="text-xs text-gray-500">{model.settings.style}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Cube className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No models yet</p>
              <p className="text-xs text-gray-400 mt-1">Upload images in Model Converter</p>
            </div>
          )}
        </div>

        {/* 3D Viewer */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedModel ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{selectedModel.name}</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Supports: .max, .fbx, .gltf, .glb
                  </span>
                  <button
                    onClick={() => setViewerSettings({
                      ...viewerSettings,
                      autoRotate: !viewerSettings.autoRotate
                    })}
                    className={`p-2 rounded-lg transition-colors ${
                      viewerSettings.autoRotate
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {viewerSettings.autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => shareModel(selectedModel)}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadModel(selectedModel)}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3D Viewer Area */}
              <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-lg h-[600px] mb-6 overflow-hidden">
                {/* Interactive 3D Scene */}
                <ThreeDScene
                  imageUrl={selectedModel.originalImage}
                  autoRotate={viewerSettings.autoRotate}
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4 pointer-events-none z-10">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1 shadow-lg">
                    <Eye className="w-3 h-3" />
                    <span>Interactive 3D Mode</span>
                  </span>
                </div>

                {/* Model info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6 pointer-events-none z-10">
                  <p className="text-white font-semibold text-lg">{selectedModel.name}</p>
                  <p className="text-white/80 text-sm mt-1">
                    Style: {selectedModel.settings.style} | Quality: {selectedModel.settings.quality} | Depth: {selectedModel.settings.depth}
                  </p>
                  <p className="text-blue-300 text-xs mt-2 flex items-center space-x-2">
                    <span>✨ CSS 3D Transform Engine</span>
                    <span>•</span>
                    <span>Drag to rotate</span>
                    <span>•</span>
                    <span>Scroll to zoom</span>
                  </p>
                </div>
              </div>

              {/* Model Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Model Details</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Style: {selectedModel.settings.style}</p>
                    <p>Quality: {selectedModel.settings.quality}</p>
                    <p>Depth: {selectedModel.settings.depth}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Created</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedModel.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadModel(selectedModel)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => shareModel(selectedModel)}
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center max-w-md">
                <Cube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No 3D Models Available</h3>
                <p className="text-gray-600 mb-4">Upload images in the 3D Model Converter to create 3D models.</p>
                <p className="text-sm text-gray-500">
                  Models will appear here automatically after conversion is complete.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}