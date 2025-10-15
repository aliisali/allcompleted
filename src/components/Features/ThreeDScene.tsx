import React, { useEffect, useRef, useState } from 'react';

interface ThreeDSceneProps {
  imageUrl: string;
  autoRotate: boolean;
  onLoad?: () => void;
}

export function ThreeDScene({ imageUrl, autoRotate, onLoad }: ThreeDSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (autoRotate && !isDragging) {
      const animate = () => {
        setRotation(prev => ({
          x: prev.x,
          y: (prev.y + 0.5) % 360
        }));
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;

    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
      y: (prev.y + deltaX * 0.5) % 360
    }));

    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ perspective: '1000px' }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `
            rotateX(${rotation.x}deg)
            rotateY(${rotation.y}deg)
            scale(${zoom})
          `,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Main 3D Object - Extruded Image */}
        <div
          className="relative"
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Front face */}
          <img
            src={imageUrl}
            alt="3D Model Front"
            className="w-96 h-96 object-contain rounded-lg shadow-2xl"
            style={{
              transform: 'translateZ(30px)',
              backfaceVisibility: 'hidden'
            }}
            onLoad={onLoad}
          />

          {/* Back face */}
          <img
            src={imageUrl}
            alt="3D Model Back"
            className="absolute top-0 left-0 w-96 h-96 object-contain rounded-lg shadow-2xl opacity-50"
            style={{
              transform: 'translateZ(-30px) rotateY(180deg)',
              backfaceVisibility: 'hidden'
            }}
          />

          {/* Depth sides */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-0 w-96 h-96"
              style={{
                background: `linear-gradient(135deg, rgba(59, 130, 246, ${0.3 - i * 0.04}), rgba(147, 51, 234, ${0.3 - i * 0.04}))`,
                transform: `translateZ(${25 - i * 10}px)`,
                opacity: 0.6,
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            />
          ))}

          {/* Edge highlights */}
          <div
            className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-400"
            style={{
              transform: 'translateZ(30px) rotateY(90deg) translateX(192px)',
              transformOrigin: 'left center',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"
            style={{
              transform: 'translateZ(30px) rotateX(-90deg) translateY(192px)',
              transformOrigin: 'center top',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
            }}
          />
        </div>
      </div>

      {/* Interaction hint */}
      {!isDragging && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-xs backdrop-blur-sm pointer-events-none">
          Drag to rotate • Scroll to zoom
        </div>
      )}

      {/* Rotation indicator */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-xs backdrop-blur-sm">
        X: {Math.round(rotation.x)}° Y: {Math.round(rotation.y)}°
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-xs backdrop-blur-sm">
        Zoom: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
}
