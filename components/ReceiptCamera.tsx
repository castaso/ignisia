import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import Button from './common/Button';
import Spinner from './common/Spinner';
import CameraIcon from './icons/CameraIcon';

interface ReceiptCameraProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const ReceiptCamera: React.FC<ReceiptCameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { showNotification } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        stopCamera();
        onCapture(dataUrl);
      }
    }
  }, [onCapture, stopCamera]);
  
  const startCamera = useCallback(async () => {
    try {
      // Prefer the rear camera for receipts
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
            console.error("Video play failed:", err);
            showNotification('Could not start the camera feed.', 'error');
            setError('Could not start the camera feed.');
        });
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      showNotification('Camera access is required. Please enable it in your browser settings.', 'error');
      setError('Camera access denied.');
      setIsLoading(false);
    }
  }, [showNotification]);


  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);


  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[60] p-4">
      <div className="relative w-full max-w-2xl mx-auto aspect-[9/16] sm:aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
        {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Spinner/>
                <p className="mt-2">Starting camera...</p>
            </div>
        )}
        {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
                <p>{error}</p>
                <Button onClick={onCancel} className="mt-4 !bg-red-600">Close</Button>
            </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isLoading || error ? 'hidden' : ''}`}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="mt-8 flex items-center justify-center space-x-4">
        <Button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600">
          Cancel
        </Button>
        <Button onClick={handleCapture} className="w-20 h-20 !rounded-full !p-0 flex items-center justify-center" disabled={isLoading || !!error}>
          <CameraIcon className="h-8 w-8"/>
        </Button>
         <div className="w-[88px]"></div> {/* Spacer */}
      </div>
    </div>
  );
};

export default ReceiptCamera;
