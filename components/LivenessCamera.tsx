import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LivenessChallenge, LivenessChallengeType } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import Button from './common/Button';
import Spinner from './common/Spinner';

interface LivenessCameraProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const challenges: LivenessChallenge[] = [
    { type: LivenessChallengeType.BLINK, instruction: 'Blink Both Eyes' },
    { type: LivenessChallengeType.SMILE, instruction: 'Smile for the Camera' },
];

enum LivenessState {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  CAPTURING = 'CAPTURING',
  ERROR = 'ERROR',
}

const LivenessCamera: React.FC<LivenessCameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { showNotification } = useNotification();

  const [livenessState, setLivenessState] = useState<LivenessState>(LivenessState.INITIALIZING);
  const [statusMessage, setStatusMessage] = useState('Initializing Camera...');
  const [ovalColor, setOvalColor] = useState('border-white');
  const [challenge] = useState<LivenessChallenge>(() => challenges[Math.floor(Math.random() * challenges.length)]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onCapture(dataUrl);
      }
    }
  }, [onCapture, stopCamera]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
            console.error("Video play failed:", err);
            showNotification('Could not start the camera feed.', 'error');
        });
        setLivenessState(LivenessState.READY);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      showNotification('Camera access is required. Please enable it in your browser settings.', 'error');
      setLivenessState(LivenessState.ERROR);
      onCancel();
    }
  }, [showNotification, onCancel]);

  // Effect to initialize the camera
  useEffect(() => {
    if (livenessState === LivenessState.INITIALIZING) {
      startCamera();
    }
    // Ensure camera is stopped on unmount
    return () => {
      stopCamera();
    };
  }, [livenessState, startCamera, stopCamera]);

  // Effect for the main liveness detection sequence, runs only in READY state
  useEffect(() => {
    if (livenessState !== LivenessState.READY) return;

    const timers: number[] = [];

    // 1. Initial positioning
    setStatusMessage('Position your face in the oval');
    setOvalColor('border-white');

    // 2. Simulate face detected & centered
    timers.push(window.setTimeout(() => {
      setStatusMessage('Great! Hold still...');
      setOvalColor('border-green-400');
    }, 2500));

    // 3. Announce challenge
    timers.push(window.setTimeout(() => {
      setStatusMessage(`Get Ready: ${challenge.instruction}`);
      setOvalColor('border-yellow-400');
    }, 4500));
    
    // 4. Start Challenge and provide specific feedback
    timers.push(window.setTimeout(() => {
      setStatusMessage(challenge.instruction);
      
      if (challenge.type === LivenessChallengeType.SMILE) {
        timers.push(window.setTimeout(() => {
          setStatusMessage('Hold your smile longer...');
        }, 1500));
      }
    }, 6500));

    // 5. Transition to capture state
    timers.push(window.setTimeout(() => {
      setLivenessState(LivenessState.CAPTURING);
    }, 8500));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [livenessState, challenge]);
  
  // Effect to handle the final capture action
  useEffect(() => {
    if (livenessState === LivenessState.CAPTURING) {
      setStatusMessage('Success! Capturing proof...');
      setOvalColor('border-indigo-500');
      // A small delay to allow user to see the success message before closing
      const captureTimer = setTimeout(() => {
        captureImage();
      }, 500);
      return () => clearTimeout(captureTimer);
    }
  }, [livenessState, captureImage]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-lg mx-auto">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-2xl shadow-lg transform -scale-x-100"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-[60%] h-[70%] border-4 border-dashed ${ovalColor} rounded-[50%] opacity-75 transition-all duration-500 ease-in-out`}></div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="mt-6 text-center text-white h-16 flex items-center justify-center">
        {livenessState === LivenessState.INITIALIZING && <div className="flex justify-center items-center"><Spinner /><span className="ml-2">{statusMessage}</span></div>}
        {livenessState === LivenessState.ERROR && <p className="text-red-400 font-semibold">Camera failed to start.</p>}
        {livenessState !== LivenessState.INITIALIZING && livenessState !== LivenessState.ERROR && (
          <p className="text-2xl font-bold transition-opacity duration-300">{statusMessage}</p>
        )}
      </div>

      <div className="absolute bottom-8">
        <Button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default LivenessCamera;