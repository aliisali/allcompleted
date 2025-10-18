import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Download, RotateCw } from 'lucide-react';

interface ARCameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  onClose: () => void;
  title?: string;
  overlayImage?: string;
}

export function ARCameraCapture({ onCapture, onClose, title = 'AR Camera', overlayImage }: ARCameraCaptureProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    requestCameraPermission();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (cameraActive) {
      stopCamera();
      requestCameraPermission();
    }
  }, [facingMode]);

  const requestCameraPermission = async () => {
    try {
      setPermissionError(null);
      console.log('📹 Requesting camera permission...');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Camera API not supported');
        setPermissionError('Camera is not supported on this device or browser.');
        return;
      }

      console.log('📹 Requesting camera with facingMode:', facingMode);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      console.log('✅ Camera stream obtained:', stream.getVideoTracks().length, 'video tracks');
      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        console.log('📹 Video element found, setting stream...');

        // Add event listener to check when video metadata loads
        video.onloadedmetadata = () => {
          console.log('📹 Video metadata loaded');
          console.log('📹 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        };

        video.onloadeddata = () => {
          console.log('📹 Video data loaded - camera feed ready');
        };

        try {
          await video.play();
          console.log('✅ Camera started successfully, video is playing');
          setCameraActive(true);
          setPermissionError(null);
        } catch (playError) {
          console.error('❌ Error playing video:', playError);
          setPermissionError('Failed to start video playback');
        }
      } else {
        console.error('❌ Video element not found');
      }
    } catch (error: any) {
      console.error('Camera error:', error);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionError('No camera found on this device.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setPermissionError('Camera is already in use by another application.');
      } else {
        setPermissionError('Unable to access camera. Please check your browser permissions.');
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

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (overlayImage) {
      const img = new Image();
      img.src = overlayImage;
      img.onload = () => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.5;
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        context.drawImage(img, x, y, img.width * scale, img.height * scale);

        const imageUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageUrl);
      };
    } else {
      const imageUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageUrl);
    }
  };

  const handleConfirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/60 backdrop-blur-md">
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        {permissionError ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-6 max-w-md">
              <Camera className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-300 font-semibold mb-2 text-center">Camera Access Required</p>
              <p className="text-red-200 text-sm mb-4 text-center">{permissionError}</p>
              <div className="bg-black/40 rounded-lg p-4 mb-4">
                <p className="text-white text-xs font-bold mb-2">To enable camera access:</p>
                <ol className="text-gray-300 text-xs space-y-2 list-decimal list-inside">
                  <li>Look for the camera icon in your browser's address bar</li>
                  <li>Click it and select "Allow" for camera permissions</li>
                  <li>Refresh the page if needed</li>
                  <li>Click the button below to try again</li>
                </ol>
              </div>
              <button
                onClick={requestCameraPermission}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !cameraActive ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-20 h-20 text-white/50 mx-auto mb-4 animate-pulse" />
              <p className="text-white text-lg">Starting camera...</p>
            </div>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#000'
              }}
            />
            {overlayImage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src={overlayImage}
                  alt="Overlay"
                  className="max-w-[50%] max-h-[50%] opacity-70"
                />
              </div>
            )}
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-6 bg-black/60 backdrop-blur-md">
        {capturedImage ? (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetake}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold flex items-center gap-2"
            >
              <RotateCw className="w-5 h-5" />
              Retake
            </button>
            <button
              onClick={handleConfirmCapture}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Use This Photo
            </button>
          </div>
        ) : cameraActive && !permissionError ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 mx-auto bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-500"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full" />
            </button>
            <button
              onClick={toggleCamera}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold mx-auto flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Switch Camera
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
