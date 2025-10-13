import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RotateCcw, Upload, Download } from 'lucide-react';

export default function ARCameraModule() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string>('');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        setError('');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(`Camera access denied. Please allow camera permissions in your browser settings. Error: ${err.message}`);
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
      }
    }
  };

  const downloadPhoto = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.download = `blindscloud-ar-${Date.now()}.png`;
      link.href = capturedImage;
      link.click();
    }
  };

  const retakePhoto = () => {
    setCapturedImage('');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6" />
            <div>
              <h2 className="font-semibold">AR Camera</h2>
              <p className="text-xs text-gray-300">BlindsCloud Professional</p>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Close camera"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Camera View */}
      {!capturedImage ? (
        <div className="relative flex-1 flex items-center justify-center bg-black">
          {error ? (
            <div className="text-center p-6 max-w-md">
              <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 mb-4">
                <Camera className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">Camera Access Required</h3>
                <p className="text-gray-300 text-sm mb-4">{error}</p>
                <div className="text-left bg-black/50 p-4 rounded-lg text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-2">How to enable camera:</p>
                  <p>1. Look for the camera icon in your browser's address bar</p>
                  <p>2. Click it and select "Allow" for camera access</p>
                  <p>3. Refresh this page</p>
                  <p className="mt-3 text-yellow-400">Note: Camera requires HTTPS in production</p>
                </div>
              </div>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Camera Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20"></div>
                  ))}
                </div>
              </div>

              {/* Center Focus Guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative flex-1 flex items-center justify-center bg-black">
          <img src={capturedImage} alt="Captured" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* Bottom Controls */}
      {isStreaming && !error && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-6">
          {!capturedImage ? (
            <div className="flex items-center justify-center space-x-8">
              <button
                onClick={switchCamera}
                className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Switch camera"
              >
                <RotateCcw className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={capturePhoto}
                className="p-6 bg-white hover:bg-gray-100 rounded-full transition-all transform hover:scale-105 shadow-2xl"
                title="Take photo"
              >
                <Camera className="w-8 h-8 text-gray-900" />
              </button>

              <div className="w-12 h-12"></div>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={retakePhoto}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Retake</span>
              </button>

              <button
                onClick={downloadPhoto}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Info Badge */}
      {isStreaming && !error && !capturedImage && (
        <div className="absolute top-20 left-4 right-4 z-10 flex justify-center">
          <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
            Position your window and tap to capture
          </div>
        </div>
      )}
    </div>
  );
}
