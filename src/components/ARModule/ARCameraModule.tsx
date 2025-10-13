import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Image as ImageIcon, RotateCcw, ZoomIn, ZoomOut, Download, Trash2, Grid3x3, X } from 'lucide-react';

export default function ARCameraModule() {
  const [cameraActive, setCameraActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [showGrid, setShowGrid] = useState(true);
  const [savedScenes, setSavedScenes] = useState<any[]>([]);
  const [cameraError, setCameraError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const saved = localStorage.getItem('ar_files');
    const scenes = localStorage.getItem('ar_scenes');
    if (saved) setUploadedImages(JSON.parse(saved));
    if (scenes) setSavedScenes(JSON.parse(scenes));
  }, []);

  const startCamera = async () => {
    try {
      setCameraError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          startRendering();
        };
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Cannot access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCameraActive(false);
  };

  const startRendering = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!video.videoWidth || !cameraActive) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (showGrid) {
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 1; i < 3; i++) {
          const x = (canvas.width / 3) * i;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let i = 1; i < 3; i++) {
          const y = (canvas.height / 3) * i;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      if (selectedImage) {
        const img = new Image();
        img.src = selectedImage;
        const size = 300 * scale;
        const x = (posX / 100) * canvas.width;
        const y = (posY / 100) * canvas.height;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const updated = [...uploadedImages, result];
        setUploadedImages(updated);
        localStorage.setItem('ar_files', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    });
  };

  const captureScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = {
      id: Date.now(),
      image: canvas.toDataURL('image/png'),
      date: new Date().toLocaleString()
    };

    const updated = [scene, ...savedScenes];
    setSavedScenes(updated);
    localStorage.setItem('ar_scenes', JSON.stringify(updated));
    alert('Scene captured!');
  };

  const downloadScene = (img: string, id: number) => {
    const a = document.createElement('a');
    a.href = img;
    a.download = `ar-scene-${id}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">AR Camera</h1>
          <p className="text-blue-200">Upload files and place them in AR with your camera</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Camera View</h2>
                <div className="flex gap-2">
                  {cameraActive && selectedImage && (
                    <button
                      onClick={captureScene}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
                    >
                      <Download className="w-5 h-5 inline mr-2" />
                      Capture
                    </button>
                  )}
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-4 py-2 rounded-lg ${showGrid ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cameraActive ? stopCamera : startCamera}
                    className={`px-4 py-2 rounded-lg font-bold text-white ${
                      cameraActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    <Camera className="w-5 h-5 inline mr-2" />
                    {cameraActive ? 'Stop' : 'Start'}
                  </button>
                </div>
              </div>

              <div className="relative bg-black rounded-xl overflow-hidden" style={{ height: '500px' }}>
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-red-900/50">
                    <div className="bg-red-500 text-white p-6 rounded-lg max-w-md text-center">
                      <X className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-bold mb-2">Camera Error</p>
                      <p className="text-sm">{cameraError}</p>
                      <button
                        onClick={() => { setCameraError(''); startCamera(); }}
                        className="mt-4 px-4 py-2 bg-white text-red-500 rounded-lg font-bold"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {!cameraActive && !cameraError ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-20 h-20 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-white text-xl font-bold mb-2">Ready to Start</h3>
                      <p className="text-gray-300 mb-4">Click START to begin AR camera</p>
                      <button
                        onClick={startCamera}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg"
                      >
                        START CAMERA NOW
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="hidden"
                    />
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full object-contain"
                    />
                  </>
                )}
              </div>

              {cameraActive && selectedImage && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-bold mb-2 block">Scale: {scale.toFixed(1)}x</label>
                    <input
                      type="range"
                      min="0.3"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setScale(Math.max(0.3, scale - 0.1))} className="px-3 py-1 bg-gray-700 text-white rounded">
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button onClick={() => setScale(Math.min(3, scale + 0.1))} className="px-3 py-1 bg-gray-700 text-white rounded">
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-white text-sm font-bold mb-2 block">Rotation: {rotation}°</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full"
                    />
                    <button
                      onClick={() => { setScale(1); setRotation(0); setPosX(50); setPosY(50); }}
                      className="mt-2 px-3 py-1 bg-gray-700 text-white rounded w-full"
                    >
                      <RotateCcw className="w-4 h-4 inline mr-2" />
                      Reset
                    </button>
                  </div>
                  <div>
                    <label className="text-white text-sm font-bold mb-2 block">Position X: {posX}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={posX}
                      onChange={(e) => setPosX(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-bold mb-2 block">Position Y: {posY}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={posY}
                      onChange={(e) => setPosY(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Upload AR Files</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold mb-4"
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Upload Files
              </button>

              {uploadedImages.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">No files uploaded</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadedImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => { setSelectedImage(img); if (!cameraActive) startCamera(); }}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                        selectedImage === img ? 'border-green-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`File ${i + 1}`} className="w-full h-24 object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = uploadedImages.filter((_, idx) => idx !== i);
                          setUploadedImages(updated);
                          localStorage.setItem('ar_files', JSON.stringify(updated));
                          if (selectedImage === img) setSelectedImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {savedScenes.length > 0 && (
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Saved Scenes ({savedScenes.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {savedScenes.map((scene) => (
                <div key={scene.id} className="relative group">
                  <img src={scene.image} alt="Scene" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={() => downloadScene(scene.image, scene.id)}
                      className="p-2 bg-blue-500 rounded"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        const updated = savedScenes.filter(s => s.id !== scene.id);
                        setSavedScenes(updated);
                        localStorage.setItem('ar_scenes', JSON.stringify(updated));
                      }}
                      className="p-2 bg-red-500 rounded"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <p className="text-white text-xs mt-1">{scene.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
