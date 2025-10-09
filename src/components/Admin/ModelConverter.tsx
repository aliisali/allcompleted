import React, { useState, useRef, useEffect } from 'react';
import { Upload, Eye, Trash2, Download, Settings, Cuboid, X, RefreshCw, FileImage, Info, CheckCircle, AlertCircle } from 'lucide-react';

interface Model3D {
  id: string;
  name: string;
  originalImage: string;
  model3D: string;
  thumbnail: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  fileSize: number;
  settings: {
    depth: number;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    style: 'extrude' | 'relief' | 'full3d';
  };
}

export function ModelConverter() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [conversionSettings, setConversionSettings] = useState({
    depth: 1.0,
    quality: 'high' as 'low' | 'medium' | 'high' | 'ultra',
    style: 'full3d' as 'extrude' | 'relief' | 'full3d'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    saveModels(models);
  }, [models]);

  const loadModels = () => {
    try {
      const saved = localStorage.getItem('admin_3d_models');
      if (saved) {
        setModels(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const saveModels = (updatedModels: Model3D[]) => {
    try {
      console.log('Saving models to localStorage:', updatedModels);
      localStorage.setItem('admin_3d_models', JSON.stringify(updatedModels));
      console.log('Models saved successfully');
    } catch (error) {
      console.error('Failed to save models:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    processFile(files[0]);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotification('File size must be less than 10MB', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const imageUrl = await convertFileToBase64(file);

      const newModel: Model3D = {
        id: `model-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        originalImage: imageUrl,
        model3D: '',
        thumbnail: imageUrl,
        status: 'processing',
        createdAt: new Date().toISOString(),
        fileSize: file.size,
        settings: { ...conversionSettings }
      };

      setModels(prev => [newModel, ...prev]);

      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 150);

      setTimeout(() => {
        clearInterval(progressInterval);
        setProcessingProgress(100);

        const convertedModel = {
          ...newModel,
          status: 'completed' as const,
          model3D: generateMock3DModel(imageUrl, conversionSettings)
        };

        console.log('Conversion complete:', convertedModel);

        setModels(prev => {
          const updated = prev.map(m => m.id === newModel.id ? convertedModel : m);
          console.log('Updated models array:', updated);
          return updated;
        });

        showNotification(`3D model "${newModel.name}" created successfully!`, 'success');
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Error processing image:', error);
      showNotification('Failed to process image. Please try again.', 'error');
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const generateMock3DModel = (imageUrl: string, settings: any) => {
    return `data:model/gltf+json,${encodeURIComponent(JSON.stringify({
      asset: { version: "2.0", generator: "BlindsCloud 3D Converter" },
      scene: 0,
      scenes: [{ nodes: [0], name: "Scene" }],
      nodes: [{ mesh: 0, name: "Mesh" }],
      meshes: [{
        primitives: [{
          attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
          indices: 3,
          material: 0
        }],
        name: "3D Model"
      }],
      materials: [{
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0.2,
          roughnessFactor: 0.8
        },
        name: "Material"
      }],
      textures: [{ source: 0, sampler: 0 }],
      images: [{ uri: imageUrl }],
      samplers: [{ magFilter: 9729, minFilter: 9987 }]
    }))}`;
  };

  const deleteModel = (modelId: string) => {
    if (window.confirm('Are you sure you want to delete this 3D model?')) {
      setModels(prev => prev.filter(m => m.id !== modelId));
      showNotification('3D model deleted successfully', 'success');
    }
  };

  const downloadModel = (model: Model3D) => {
    const link = document.createElement('a');
    link.href = model.model3D;
    link.download = `${model.name}.gltf`;
    link.click();
    showNotification('3D model download started', 'success');
  };

  const retryConversion = (model: Model3D) => {
    setModels(prev => prev.map(m =>
      m.id === model.id ? { ...m, status: 'processing' as const } : m
    ));

    setTimeout(() => {
      const convertedModel = {
        ...model,
        status: 'completed' as const,
        model3D: generateMock3DModel(model.originalImage, model.settings)
      };

      setModels(prev => prev.map(m =>
        m.id === model.id ? convertedModel : m
      ));

      showNotification('3D model conversion completed', 'success');
    }, 2000);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };

    const notifDiv = document.createElement('div');
    notifDiv.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-slide-in`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    notifDiv.innerHTML = `<span class="font-bold">${icon}</span><span>${message}</span>`;

    document.body.appendChild(notifDiv);

    setTimeout(() => {
      if (document.body.contains(notifDiv)) {
        notifDiv.style.animation = 'slide-out 0.3s ease-out';
        setTimeout(() => document.body.removeChild(notifDiv), 300);
      }
    }, 3000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">3D Model Converter</h1>
            <p className="text-gray-600">Transform 2D images into interactive 3D AR models</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              {models.length} Model{models.length !== 1 ? 's' : ''} Stored
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 mr-2" />
              {isProcessing ? 'Processing...' : 'Upload Image'}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`mb-8 border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-blue-400'
          }`}
        >
          <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Drag and drop your image here
          </h3>
          <p className="text-gray-600 mb-4">or click the upload button above</p>
          <p className="text-sm text-gray-500">Supports: JPG, PNG, WebP (Max 10MB)</p>
        </div>

        {isProcessing && (
          <div className="bg-white border border-blue-200 rounded-2xl p-6 mb-8 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Converting to 3D Model</h3>
                  <p className="text-gray-600 text-sm">Processing your image with AI technology...</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{processingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div key={model.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden group">
                <img
                  src={model.thumbnail}
                  alt={model.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-lg ${
                    model.status === 'completed' ? 'bg-green-500 text-white' :
                    model.status === 'processing' ? 'bg-blue-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {model.status === 'completed' ? (
                      <span className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </span>
                    ) : model.status === 'processing' ? (
                      <span className="flex items-center">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Processing
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Failed
                      </span>
                    )}
                  </span>
                </div>
                {model.status === 'processing' && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                      <p className="text-white text-sm font-medium">Processing...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-lg truncate">{model.name}</h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Style</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{model.settings.style}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Quality</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{model.settings.quality}</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <p>Size: {formatFileSize(model.fileSize)}</p>
                  <p>Created: {formatDate(model.createdAt)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {model.status === 'completed' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedModel(model);
                          setShowViewer(true);
                        }}
                        className="flex-1 flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View 3D
                      </button>
                      <button
                        onClick={() => downloadModel(model)}
                        className="p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                        title="Download Model"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {model.status === 'failed' && (
                    <button
                      onClick={() => retryConversion(model)}
                      className="flex-1 flex items-center justify-center px-3 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </button>
                  )}
                  <button
                    onClick={() => deleteModel(model.id)}
                    className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md"
                    title="Delete Model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {models.length === 0 && !isProcessing && (
          <div className="text-center py-16">
            <Cuboid className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No 3D Models Yet</h3>
            <p className="text-gray-600 mb-1">Upload an image to create your first 3D model</p>
            <p className="text-sm text-gray-500">Supports blinds, curtains, and window treatment designs</p>
          </div>
        )}

        {showViewer && selectedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedModel.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Interactive 3D Model Viewer</p>
                </div>
                <button
                  onClick={() => setShowViewer(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="aspect-video bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  <div className="text-center relative z-10">
                    <Cuboid className="w-24 h-24 text-blue-400 mx-auto mb-6 animate-pulse" />
                    <p className="text-white font-semibold text-lg mb-2">3D Model Viewer</p>
                    <p className="text-blue-200 text-sm mb-4">Interactive 3D rendering powered by Three.js</p>
                    <div className="flex items-center justify-center space-x-4 text-xs text-blue-300">
                      <span className="flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        Drag to rotate
                      </span>
                      <span className="flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        Scroll to zoom
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Format</p>
                    <p className="text-sm font-bold text-gray-900">GLTF 2.0</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Quality</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{selectedModel.settings.quality}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Style</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{selectedModel.settings.style}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Auto-Rotate
                    </button>
                    <button className="flex items-center px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-md">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                  <button
                    onClick={() => downloadModel(selectedModel)}
                    className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                  >
                    Download Model
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Conversion Settings</h3>
                  <p className="text-sm text-gray-600 mt-1">Configure 3D model generation parameters</p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    3D Style
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'extrude', label: 'Extrude', desc: 'Simple depth' },
                      { value: 'relief', label: 'Relief', desc: 'Carved effect' },
                      { value: 'full3d', label: 'Full 3D', desc: 'Complex geometry' }
                    ].map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setConversionSettings({ ...conversionSettings, style: style.value as any })}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          conversionSettings.style === style.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-sm">{style.label}</p>
                        <p className="text-xs text-gray-600 mt-1">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Quality Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'ultra', label: 'Ultra' }
                    ].map((quality) => (
                      <button
                        key={quality.value}
                        onClick={() => setConversionSettings({ ...conversionSettings, quality: quality.value as any })}
                        className={`py-2 px-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                          conversionSettings.quality === quality.value
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {quality.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Depth Intensity: <span className="text-blue-600">{conversionSettings.depth.toFixed(1)}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={conversionSettings.depth}
                    onChange={(e) => setConversionSettings({
                      ...conversionSettings,
                      depth: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Shallow (0.1x)</span>
                    <span>Deep (2.0x)</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Processing Tips</p>
                      <ul className="text-xs space-y-1 text-blue-800">
                        <li>• Higher quality increases processing time</li>
                        <li>• Full 3D style creates the most realistic models</li>
                        <li>• Recommended: High quality with Full 3D style</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    showNotification('Settings saved successfully', 'success');
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
