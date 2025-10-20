import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Download, Trash2, X, ZoomIn, ZoomOut, RotateCcw, Grid3x3 } from 'lucide-react';

export default function ARCameraModule() {
  const [showCamera, setShowCamera] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [showGrid, setShowGrid] = useState(false);
  const [savedScenes, setSavedScenes] = useState<any[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const files = localStorage.getItem('ar_uploaded_files');
    const scenes = localStorage.getItem('ar_saved_scenes');
    if (files) setUploadedFiles(JSON.parse(files));
    if (scenes) setSavedScenes(JSON.parse(scenes));

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setPermissionError(null);
      console.log('📹 Requesting camera permission...');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Camera is not supported on this device or browser.');
        return;
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      console.log('📹 Requesting camera with facingMode:', constraints.video.facingMode);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ Camera stream obtained:', stream.getVideoTracks().length, 'video tracks');
      streamRef.current = stream;

      setShowCamera(true);

      setTimeout(() => {
        if (!videoRef.current) {
          console.log('❌ Video element not found');
          setPermissionError('Failed to initialize video element. Please try again.');
          stopCamera();
          return;
        }

        console.log('✅ Video element found, attaching stream');
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded');
          videoRef.current?.play().then(() => {
            console.log('✅ Video playing successfully');
            setPermissionError(null);
            setTimeout(() => {
              requestAnimationFrame(renderFrame);
            }, 100);
          }).catch(err => {
            console.error('❌ Play failed:', err);
            setPermissionError('Failed to start video playback. Please try again.');
          });
        };

        videoRef.current.onerror = (err) => {
          console.error('❌ Video error:', err);
          setPermissionError('Video element error. Please try again.');
        };
      }, 100);

    } catch (error: any) {
      console.error('❌ Camera error:', error);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionError('No camera found on this device.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setPermissionError('Camera is already in use by another application.');
      } else if (error.name === 'AbortError') {
        setPermissionError('Camera access was interrupted. Please try again.');
      } else {
        setPermissionError(`Unable to access camera: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const renderFrame = () => {
    if (!showCamera || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      requestAnimationFrame(renderFrame);
      return;
    }

    if (!video.videoWidth || video.readyState < 2) {
      requestAnimationFrame(renderFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (showGrid) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      const cols = 3;
      const rows = 3;
      for (let i = 1; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo((canvas.width / cols) * i, 0);
        ctx.lineTo((canvas.width / cols) * i, canvas.height);
        ctx.stroke();
      }
      for (let i = 1; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / rows) * i);
        ctx.lineTo(canvas.width, (canvas.height / rows) * i);
        ctx.stroke();
      }
    }

    if (selectedFile) {
      const img = new Image();
      img.src = selectedFile;

      if (img.complete) {
        const imgSize = 250 * scale;
        const imgX = (posX / 100) * canvas.width;
        const imgY = (posY / 100) * canvas.height;

        ctx.save();
        ctx.translate(imgX, imgY);
        ctx.rotate((rotation * Math.PI) / 180);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);

        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 4;
        ctx.strokeRect(-imgSize / 2, -imgSize / 2, imgSize, imgSize);

        ctx.restore();
      }
    }

    requestAnimationFrame(renderFrame);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const updated = [...uploadedFiles, result];
        setUploadedFiles(updated);
        localStorage.setItem('ar_uploaded_files', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    });
  };

  const captureScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const screenshot = {
      id: Date.now(),
      image: canvas.toDataURL('image/png'),
      timestamp: new Date().toLocaleString()
    };

    const updated = [screenshot, ...savedScenes];
    setSavedScenes(updated);
    localStorage.setItem('ar_saved_scenes', JSON.stringify(updated));
    alert('Screenshot saved!');
  };

  const downloadScreenshot = (img: string, id: number) => {
    const link = document.createElement('a');
    link.href = img;
    link.download = `ar-screenshot-${id}.png`;
    link.click();
  };

  const deleteFile = (index: number) => {
    const updated = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updated);
    localStorage.setItem('ar_uploaded_files', JSON.stringify(updated));
    if (uploadedFiles[index] === selectedFile) setSelectedFile(null);
  };

  const deleteScreenshot = (id: number) => {
    const updated = savedScenes.filter(s => s.id !== id);
    setSavedScenes(updated);
    localStorage.setItem('ar_saved_scenes', JSON.stringify(updated));
  };

  if (showCamera) {
    return (
      <div className="fixed inset-0 z-50 bg-black" style={{ touchAction: 'none' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            objectFit: 'cover',
            zIndex: 2
          }}
        />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg">
            <p className="text-white font-bold">AR Camera Active</p>
            {selectedFile && (
              <p className="text-green-400 text-sm">Object placed - Use controls below</p>
            )}
          </div>
          <button
            onClick={stopCamera}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {selectedFile && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-lg z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-white text-xs font-bold mb-1 block">Scale: {scale.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-white text-xs font-bold mb-1 block">Rotation: {rotation}°</label>
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
                <label className="text-white text-xs font-bold mb-1 block">Position X: {posX}%</label>
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
                <label className="text-white text-xs font-bold mb-1 block">Position Y: {posY}%</label>
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

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-4 py-2 rounded-lg font-bold ${showGrid ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
              >
                <Grid3x3 className="w-5 h-5 inline mr-2" />
                Grid
              </button>
              <button
                onClick={() => { setScale(1); setRotation(0); setPosX(50); setPosY(50); }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Reset
              </button>
              <button
                onClick={captureScreenshot}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Capture
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 text-center">
          <Camera className="w-20 h-20 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">AR Camera</h1>
          <p className="text-blue-200 text-lg mb-6">Upload files, place them in AR, and capture screenshots</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Files</h2>
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
              className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg mb-4"
            >
              <Upload className="w-6 h-6 inline mr-3" />
              Upload Files
            </button>

            {uploadedFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No files uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {uploadedFiles.map((file, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedFile(file)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                      selectedFile === file ? 'border-green-500 scale-105' : 'border-transparent'
                    }`}
                  >
                    <img src={file} alt={`File ${i + 1}`} className="w-full h-32 object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(i);
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {selectedFile === file && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">SELECTED</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Start AR</h2>

            {permissionError && (
              <div className="mb-4 bg-red-500/20 border-2 border-red-500 rounded-lg p-4">
                <p className="text-red-300 font-semibold mb-2">Camera Access Required</p>
                <p className="text-red-200 text-sm">{permissionError}</p>
                <div className="mt-3 text-left">
                  <p className="text-white text-xs font-bold mb-2">To enable camera access:</p>
                  <ul className="text-gray-300 text-xs space-y-1 list-disc list-inside">
                    <li>Click the camera icon in your browser's address bar</li>
                    <li>Select "Allow" for camera permissions</li>
                    <li>Reload the page and try again</li>
                  </ul>
                </div>
              </div>
            )}

            {!selectedFile ? (
              <div className="text-center py-12">
                <p className="text-gray-300 mb-4">Select a file first, then start AR camera</p>
              </div>
            ) : (
              <div className="text-center">
                <img src={selectedFile} alt="Selected" className="w-full h-48 object-cover rounded-lg mb-4" />
                <button
                  onClick={startCamera}
                  className="w-full px-8 py-6 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-2xl"
                >
                  <Camera className="w-8 h-8 inline mr-3" />
                  START AR CAMERA
                </button>
                <p className="text-gray-300 text-sm mt-3">Opens fullscreen AR view</p>
              </div>
            )}
          </div>
        </div>

        {savedScenes.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Saved Screenshots ({savedScenes.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {savedScenes.map((scene) => (
                <div key={scene.id} className="relative group">
                  <img src={scene.image} alt="Screenshot" className="w-full h-40 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={() => downloadScreenshot(scene.image, scene.id)}
                      className="p-3 bg-blue-500 hover:bg-blue-600 rounded-lg"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => deleteScreenshot(scene.id)}
                      className="p-3 bg-red-500 hover:bg-red-600 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <p className="text-white text-xs mt-2">{scene.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
