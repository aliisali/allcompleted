import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Download, X, RotateCcw, Maximize2 } from 'lucide-react';

export default function ARCameraV2() {
  const [cameraActive, setCameraActive] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [flip, setFlip] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, posX: 50, posY: 50 });
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setPermissionError(null);
      console.log('📹 Starting AR camera...');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Camera is not supported on this device or browser.');
        return;
      }

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Camera stream obtained');

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');

        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded');
          videoRef.current?.play().then(() => {
            console.log('✅ Video playing');
            setCameraActive(true);
            setPermissionError(null);
          }).catch(err => {
            console.error('❌ Play failed:', err);
            setPermissionError('Failed to start video playback. Please try again.');
          });
        };
      }
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
    setCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setOverlayVisible(true);
      setScale(100);
      setRotation(0);
      setOpacity(100);
      setPosition({ x: 50, y: 50 });
      setFlip(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!stageRef.current) return;
    setDragging(true);
    const rect = stageRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.y) / rect.height) * 100;
    setPosition({
      x: Math.max(0, Math.min(100, dragStart.posX + dx)),
      y: Math.max(0, Math.min(100, dragStart.posY + dy))
    });
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const captureScreenshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const overlay = overlayRef.current;

    if (!canvas || !video) return;

    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (overlayVisible && overlay && overlay.complete) {
      const centerX = (position.x / 100) * canvas.width;
      const centerY = (position.y / 100) * canvas.height;
      const imgW = overlay.naturalWidth * (scale / 100);
      const imgH = overlay.naturalHeight * (scale / 100);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flip ? -1 : 1, 1);
      ctx.globalAlpha = opacity / 100;
      ctx.drawImage(overlay, -imgW / 2, -imgH / 2, imgW, imgH);
      ctx.restore();
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `ar-capture-${Date.now()}.png`;
    link.click();
  };

  const centerOverlay = () => {
    setPosition({ x: 50, y: 50 });
  };

  const fitToWidth = () => {
    if (!overlayRef.current) return;
    const targetScale = 90;
    setScale(targetScale);
  };

  const resetOverlay = () => {
    setUploadedImage(null);
    setOverlayVisible(false);
    setScale(100);
    setRotation(0);
    setOpacity(100);
    setPosition({ x: 50, y: 50 });
    setFlip(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">AR Camera V2 — Advanced</h1>
              <p className="text-blue-200">Upload any image, place as AR overlay, drag to position, and capture screenshots</p>
            </div>
            <div className="text-sm text-gray-400">Tip: Open on mobile (HTTPS) for best camera access</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div
              ref={stageRef}
              className="relative bg-black rounded-xl overflow-hidden"
              style={{ minHeight: '520px' }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {!cameraActive ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4 max-w-md">
                    <Camera className="w-20 h-20 text-blue-400 mx-auto mb-4" />
                    <p className="text-white text-xl font-bold mb-4">Camera Not Started</p>

                    {permissionError && (
                      <div className="mb-4 bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-left">
                        <p className="text-red-300 font-semibold mb-2">Camera Access Required</p>
                        <p className="text-red-200 text-sm mb-3">{permissionError}</p>
                        <div className="text-left">
                          <p className="text-white text-xs font-bold mb-2">To enable camera access:</p>
                          <ul className="text-gray-300 text-xs space-y-1 list-disc list-inside">
                            <li>Click the camera icon in your browser's address bar</li>
                            <li>Select "Allow" for camera permissions</li>
                            <li>Click the button below to try again</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg"
                    >
                      Start Camera
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
                    className="w-full h-full object-cover"
                  />
                  {overlayVisible && uploadedImage && (
                    <img
                      ref={overlayRef}
                      src={uploadedImage}
                      alt="AR Overlay"
                      className={`absolute ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: `translate(-50%, -50%) scale(${scale / 100}) rotate(${rotation}deg) scaleX(${flip ? -1 : 1})`,
                        opacity: opacity / 100,
                        maxWidth: '80%',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
                        borderRadius: '6px',
                        touchAction: 'none',
                        pointerEvents: 'auto'
                      }}
                      onPointerDown={handlePointerDown}
                      draggable={false}
                    />
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={captureScreenshot}
                disabled={!cameraActive}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg font-bold"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Capture Screenshot
              </button>
              <button
                onClick={resetOverlay}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Reset Overlay
              </button>
              {cameraActive && (
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  <X className="w-5 h-5 inline mr-2" />
                  Stop Camera
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">1) Upload Image</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Upload Image
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">2) Transform Controls</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Opacity <span className="text-gray-400">{opacity}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Scale <span className="text-gray-400">{scale}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">
                    Rotation <span className="text-gray-400">{rotation}°</span>
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={centerOverlay}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold"
                  >
                    Center
                  </button>
                  <button
                    onClick={() => setFlip(!flip)}
                    className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-bold"
                  >
                    Flip X
                  </button>
                  <button
                    onClick={fitToWidth}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold"
                  >
                    <Maximize2 className="w-4 h-4 inline mr-1" />
                    Fit Width
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">3) Advanced / Helpers</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>• Drag the image overlay to reposition it</p>
                <p>• Use sliders for fine-tuned adjustments</p>
                <p>• Works best on mobile with camera access</p>
                <p>• HTTPS required for camera (or localhost)</p>
              </div>
              <button
                onClick={() => setOverlayVisible(!overlayVisible)}
                className="mt-4 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
              >
                {overlayVisible ? 'Hide' : 'Show'} Overlay
              </button>
            </div>

            <div className="text-sm text-gray-400">
              Works in modern browsers. Camera access requires HTTPS or localhost.
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
