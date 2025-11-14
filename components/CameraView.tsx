import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XMarkIcon } from './icons';

interface CameraViewProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanUpStream = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
          }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("No se pudo acceder a la cámara. Revisa los permisos en tu navegador.");
      }
    };
    enableCamera();
    
    return () => {
      cleanUpStream();
    };
  }, [cleanUpStream]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fade-in">
      <video ref={videoRef} autoPlay playsInline muted className="absolute top-0 left-0 w-full h-full object-cover"></video>
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Camera UI */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-4 sm:p-6">
        <div className="w-full flex justify-end">
          <button onClick={onClose} className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors">
            <XMarkIcon className="w-8 h-8" />
          </button>
        </div>
        
        {/* Guide Frame */}
        <div className="w-full max-w-sm aspect-[3/4.2] border-4 border-dashed border-white/50 pointer-events-none shadow-2xl shadow-black/80"></div>

        <div className="w-full flex flex-col items-center pb-4">
            {error && <p className="text-white bg-red-500/80 p-3 rounded-md mb-4 text-center max-w-md">{error}</p>}
            <button
                onClick={handleCapture}
                disabled={!!error}
                className="w-20 h-20 bg-white rounded-full border-4 border-black/50 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Capturar foto"
            >
                <div className="w-16 h-16 bg-white rounded-full transition-transform duration-200 ease-in-out group-hover:scale-90 group-active:scale-95"></div>
            </button>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CameraView;