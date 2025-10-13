import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Image as ImageIcon, Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Move, Download, Trash2, Eye, Grid3x3, Sparkles } from 'lucide-react';

interface ARItem {
  id: string;
  name: string;
  image: string;
  scale: number;
  position: { x: number; y: number };
  rotation: number;
  createdAt: string;
}

export default function UpdateARViewer() {
  const [cameraActive, setCameraActive] = useState(false);
  const [arItems, setArItems] = useState<ARItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ARItem | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [showGrid, setShowGrid] = useState(true);
  const [savedScenes, setSavedScenes] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    loadSavedData();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (cameraActive) {
      renderARView();
    }
  }, [cameraActive, selectedItem, scale, rotation, position, showGrid]);

  const loadSavedData = () => {
    try {
      const items = localStorage.getItem('update_ar_items');
      const scenes = localStorage.getItem('update_ar_scenes');
      if (items) setUploadedImages(JSON.parse(items));
      if (scenes) setSavedScenes(JSON.parse(scenes));
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      showNotification('Requesting camera access...', 'success');

      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('Requesting getUserMedia with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got media stream:', stream);

      if (videoRef.current) {
        console.log('Setting video srcObject');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata loaded');
          try {
            await videoRef.current?.play();
            console.log('Video playing');
            setCameraActive(true);
            showNotification('Camera started successfully!', 'success');
          } catch (playError) {
            console.error('Error playing video:', playError);
            showNotification('Error starting video playback', 'error');
          }
        };

        videoRef.current.onerror = (err) => {
          console.error('Video element error:', err);
          showNotification('Video error occurred', 'error');
        };
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMessage = 'Camera access denied or not available';

      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not supported. Trying again...';
        setTimeout(() => startCameraFallback(), 500);
        return;
      }

      showNotification(errorMessage, 'error');
    }
  };

  const startCameraFallback = async () => {
    try {
      console.log('Trying fallback camera constraints');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play();
          setCameraActive(true);
          showNotification('Camera started with basic settings!', 'success');
        };
      }
    } catch (error) {
      console.error('Fallback camera error:', error);
      showNotification('Unable to access camera', 'error');
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    showNotification('Camera stopped', 'success');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const updated = [...uploadedImages, imageUrl];
        setUploadedImages(updated);
        localStorage.setItem('update_ar_items', JSON.stringify(updated));
        showNotification('Image uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    });
  };

  const createARItem = (imageUrl: string) => {
    const newItem: ARItem = {
      id: `ar-${Date.now()}`,
      name: `AR Item ${arItems.length + 1}`,
      image: imageUrl,
      scale: 1,
      position: { x: 50, y: 50 },
      rotation: 0,
      createdAt: new Date().toISOString()
    };

    setArItems([...arItems, newItem]);
    setSelectedItem(newItem);
    setScale(1);
    setRotation(0);
    setPosition({ x: 50, y: 50 });

    if (!cameraActive) {
      startCamera();
    }
  };

  const renderARView = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!cameraActive || !video.videoWidth) {
        requestAnimationFrame(draw);
        return;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (showGrid) {
        drawGrid(ctx, canvas.width, canvas.height);
      }

      if (selectedItem) {
        drawARItem(ctx, canvas.width, canvas.height);
      }

      requestAnimationFrame(draw);
    };

    draw();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawARItem = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!selectedItem) return;

    let img = loadedImagesRef.current.get(selectedItem.image);

    if (!img) {
      img = new Image();
      img.src = selectedItem.image;
      img.onload = () => {
        loadedImagesRef.current.set(selectedItem.image, img!);
      };
      loadedImagesRef.current.set(selectedItem.image, img);
      return;
    }

    if (!img.complete) return;

    const x = (position.x / 100) * width;
    const y = (position.y / 100) * height;
    const size = 200 * scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    ctx.drawImage(img, -size / 2, -size / 2, size, size);

    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    ctx.restore();
  };

  const captureARScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = {
      id: `scene-${Date.now()}`,
      image: canvas.toDataURL('image/png'),
      item: selectedItem,
      settings: { scale, rotation, position },
      createdAt: new Date().toISOString()
    };

    const updated = [scene, ...savedScenes];
    setSavedScenes(updated);
    localStorage.setItem('update_ar_scenes', JSON.stringify(updated));
    showNotification('AR scene captured!', 'success');
  };

  const downloadScene = (sceneImage: string, name: string) => {
    const link = document.createElement('a');
    link.download = `${name}.png`;
    link.href = sceneImage;
    link.click();
  };

  const deleteScene = (id: string) => {
    if (window.confirm('Delete this AR scene?')) {
      const updated = savedScenes.filter(s => s.id !== id);
      setSavedScenes(updated);
      localStorage.setItem('update_ar_scenes', JSON.stringify(updated));
      showNotification('Scene deleted', 'success');
    }
  };

  const deleteUploadedImage = (imageUrl: string) => {
    if (window.confirm('Delete this image?')) {
      const updated = uploadedImages.filter(img => img !== imageUrl);
      setUploadedImages(updated);
      localStorage.setItem('update_ar_items', JSON.stringify(updated));
      showNotification('Image deleted', 'success');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500'
    };

    const notif = document.createElement('div');
    notif.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => document.body.removeChild(notif), 3000);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Update AR Viewer</h1>
                <p className="text-blue-200 mt-1">Convert images to AR with live camera preview</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-500/30 text-blue-200 text-sm font-semibold rounded-full backdrop-blur-sm">
                {uploadedImages.length} Images
              </span>
              <span className="px-3 py-1 bg-cyan-500/30 text-cyan-200 text-sm font-semibold rounded-full backdrop-blur-sm">
                {savedScenes.length} Scenes
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">AR Camera View</h2>
                <div className="flex items-center space-x-2">
                  {cameraActive && selectedItem && (
                    <button
                      onClick={captureARScene}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center space-x-2 animate-pulse"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-semibold">Capture Screenshot</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      showGrid ? 'bg-blue-500 text-white' : 'bg-white/10 text-white'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cameraActive ? stopCamera : startCamera}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      cameraActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
                  </button>
                </div>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
                {!cameraActive ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <Camera className="w-20 h-20 text-blue-400 mb-6" />
                    <p className="text-white text-2xl font-bold mb-3">AR Camera Ready</p>
                    <div className="space-y-2 text-gray-300 text-sm max-w-md">
                      <p>📸 <strong>Step 1:</strong> Click "Start Camera" above</p>
                      <p>🖼️ <strong>Step 2:</strong> Upload AR model images on the right</p>
                      <p>👆 <strong>Step 3:</strong> Click an image to place it in AR view</p>
                      <p>🎮 <strong>Step 4:</strong> Adjust scale, rotation, and position</p>
                      <p>💾 <strong>Step 5:</strong> Click "Capture Screenshot" to save</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-0"
                    />
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full object-contain"
                    />
                    {selectedItem && (
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <p className="text-white text-sm font-medium">{selectedItem.name}</p>
                        <p className="text-gray-300 text-xs">Scale: {scale.toFixed(1)}x | Rotation: {rotation}°</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {cameraActive && selectedItem && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setScale(Math.max(0.1, scale - 0.1))}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setScale(Math.min(3, scale + 0.1))}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setScale(1);
                      setRotation(0);
                      setPosition({ x: 50, y: 50 });
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {selectedItem && cameraActive && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AR Controls</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Scale: {scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Rotation: {rotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Position X: {position.x}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={position.x}
                      onChange={(e) => setPosition({ ...position, x: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Position Y: {position.y}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={position.y}
                      onChange={(e) => setPosition({ ...position, y: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">AR Models</h3>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span className="font-semibold">Upload AR Models</span>
              </button>

              {uploadedImages.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300 text-sm">No AR models uploaded</p>
                  <p className="text-gray-500 text-xs mt-2">Upload images to use in AR view</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
                    >
                      <img
                        src={img}
                        alt={`AR Item ${idx + 1}`}
                        className="w-full h-24 object-cover cursor-pointer"
                        onClick={() => createARItem(img)}
                      />
                      <button
                        onClick={() => deleteUploadedImage(img)}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => createARItem(img)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
              <h3 className="text-sm font-semibold text-white mb-2">Quick Guide</h3>
              <ul className="space-y-1 text-xs text-blue-200">
                <li>• Upload images to use as AR items</li>
                <li>• Click image to place in AR view</li>
                <li>• Adjust scale, rotation, and position</li>
                <li>• Use grid for precise placement</li>
                <li>• Capture scenes to save AR photos</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Captured AR Scenes ({savedScenes.length})</h2>

          {savedScenes.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300">No captured scenes yet</p>
              <p className="text-sm text-gray-400 mt-1">Place an AR item and capture your first scene</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {savedScenes.map((scene) => (
                <div key={scene.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/30 transition-colors">
                  <img
                    src={scene.image}
                    alt="AR Scene"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <p className="text-white text-sm font-medium mb-1">
                    {new Date(scene.createdAt).toLocaleDateString()} {new Date(scene.createdAt).toLocaleTimeString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={() => downloadScene(scene.image, `AR-Scene-${scene.id}`)}
                      className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors flex items-center justify-center"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => deleteScene(scene.id)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
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
