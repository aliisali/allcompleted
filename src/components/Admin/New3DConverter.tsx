import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Box, Sparkles, Download, RotateCcw, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react';

interface ConvertedModel {
  id: string;
  name: string;
  originalImage: string;
  preview3D: string;
  createdAt: string;
  settings: {
    depth: number;
    extrusion: number;
    lighting: number;
  };
}

export default function New3DConverter() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [is3DView, setIs3DView] = useState(false);
  const [depth, setDepth] = useState(50);
  const [extrusion, setExtrusion] = useState(30);
  const [lighting, setLighting] = useState(70);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [savedModels, setSavedModels] = useState<ConvertedModel[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    loadSavedModels();
  }, []);

  useEffect(() => {
    if (uploadedImage && is3DView) {
      render3DPreview();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [uploadedImage, is3DView, depth, extrusion, lighting, rotation, zoom]);

  const loadSavedModels = () => {
    try {
      const stored = localStorage.getItem('new_3d_converter_models');
      if (stored) {
        setSavedModels(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading saved models:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setImageName(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setIs3DView(false);
    };
    reader.readAsDataURL(file);
  };

  const render3DPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 600;

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.rotate((rotation.y * Math.PI) / 180);

      const perspective = 1 - (rotation.x / 180);
      const layers = Math.floor(depth / 10);

      for (let i = layers; i >= 0; i--) {
        const layerDepth = (i / layers) * (extrusion / 100);
        const offsetX = layerDepth * 20;
        const offsetY = layerDepth * 20 * perspective;
        const scale = 1 - (layerDepth * 0.1);
        const brightness = lighting / 100 - (layerDepth * 0.3);

        ctx.globalAlpha = 0.8 - (i / layers) * 0.3;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        ctx.filter = `brightness(${brightness})`;

        const drawWidth = img.width * (300 / img.width);
        const drawHeight = img.height * (300 / img.width);
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        ctx.restore();
      }

      ctx.restore();

      ctx.strokeStyle = `rgba(100, 200, 255, ${0.3})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(canvas.width / 2 - 160, canvas.height / 2 - 120, 320, 240);
    };

    img.src = uploadedImage;
  };

  const saveModel = () => {
    if (!uploadedImage || !canvasRef.current) return;

    const preview3D = canvasRef.current.toDataURL('image/png');

    const newModel: ConvertedModel = {
      id: `model-${Date.now()}`,
      name: imageName || 'Untitled Model',
      originalImage: uploadedImage,
      preview3D: preview3D,
      createdAt: new Date().toISOString(),
      settings: {
        depth,
        extrusion,
        lighting
      }
    };

    const updated = [newModel, ...savedModels];
    setSavedModels(updated);
    localStorage.setItem('new_3d_converter_models', JSON.stringify(updated));

    showNotification('3D model saved successfully!');
  };

  const deleteModel = (id: string) => {
    if (window.confirm('Delete this 3D model?')) {
      const updated = savedModels.filter(m => m.id !== id);
      setSavedModels(updated);
      localStorage.setItem('new_3d_converter_models', JSON.stringify(updated));
      showNotification('Model deleted');
    }
  };

  const downloadModel = (model: ConvertedModel) => {
    const link = document.createElement('a');
    link.download = `${model.name}-3D.png`;
    link.href = model.preview3D;
    link.click();
  };

  const showNotification = (message: string) => {
    const notif = document.createElement('div');
    notif.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => document.body.removeChild(notif), 3000);
  };

  const resetSettings = () => {
    setDepth(50);
    setExtrusion(30);
    setLighting(70);
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">New Update: 3D Converter</h1>
                <p className="text-gray-600 mt-1">Transform 2D images into 3D with live preview</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                {savedModels.length} Saved
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIs3DView(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !is3DView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIs3DView(true)}
                    disabled={!uploadedImage}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      is3DView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    } disabled:opacity-50`}
                  >
                    <Box className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                {!uploadedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-300 text-lg font-medium">Click to upload image</p>
                    <p className="text-gray-500 text-sm mt-2">Supports JPG, PNG, WebP</p>
                  </div>
                ) : (
                  <>
                    {!is3DView ? (
                      <img
                        src={uploadedImage}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <canvas
                        ref={canvasRef}
                        className="w-full h-full"
                        style={{ imageRendering: 'auto' }}
                      />
                    )}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-sm">
                      {is3DView ? '3D View' : '2D Original'}
                    </div>
                  </>
                )}
              </div>

              {uploadedImage && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={saveModel}
                    disabled={!is3DView}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save 3D Model
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3D Settings</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depth Layers: {Math.floor(depth / 10)}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={depth}
                    onChange={(e) => setDepth(Number(e.target.value))}
                    className="w-full"
                    disabled={!uploadedImage}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extrusion: {extrusion}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={extrusion}
                    onChange={(e) => setExtrusion(Number(e.target.value))}
                    className="w-full"
                    disabled={!uploadedImage}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lighting: {lighting}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lighting}
                    onChange={(e) => setLighting(Number(e.target.value))}
                    className="w-full"
                    disabled={!uploadedImage}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation X: {rotation.x}°
                  </label>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={rotation.x}
                    onChange={(e) => setRotation({ ...rotation, x: Number(e.target.value) })}
                    className="w-full"
                    disabled={!uploadedImage}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation Y: {rotation.y}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation.y}
                    onChange={(e) => setRotation({ ...rotation, y: Number(e.target.value) })}
                    className="w-full"
                    disabled={!uploadedImage}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom: {zoom.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                    disabled={!uploadedImage}
                  />
                </div>

                <button
                  onClick={resetSettings}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  disabled={!uploadedImage}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Settings
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                <li>• Adjust depth for more 3D layers</li>
                <li>• Use extrusion to control depth effect</li>
                <li>• Rotate to view from different angles</li>
                <li>• Toggle 2D/3D view with buttons above</li>
                <li>• Save your favorite configurations</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved 3D Models ({savedModels.length})</h2>

          {savedModels.length === 0 ? (
            <div className="text-center py-12">
              <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No saved models yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload an image and create your first 3D model</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {savedModels.map((model) => (
                <div key={model.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <img
                    src={model.preview3D}
                    alt={model.name}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{model.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(model.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadModel(model)}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => deleteModel(model.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
