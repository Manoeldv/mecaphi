import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';
import Modal from './Modal';

export default function CameraCapture({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && !photo) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, photo]);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setError("Não foi possível acessar a câmera do dispositivo. Verifique as permissões do navegador.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    // startCamera is triggered by useEffect
  };

  const handleConfirm = () => {
    if (photo) {
      onCapture(photo);
      onClose();
      setPhoto(null); // Reset for next time
    }
  };

  const handleClose = () => {
    stopCamera();
    setPhoto(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Capturar Imagem" maxWidth="500px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        
        {error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger)', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: 'var(--radius-md)', width: '100%' }}>
            {error}
          </div>
        ) : (
          <div style={{ 
            width: '100%', 
            aspectRatio: '4/3', 
            backgroundColor: '#000', 
            borderRadius: 'var(--radius-md)', 
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!photo && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {photo && (
              <img src={photo} alt="Captura" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        )}

        {/* Controls */}
        {!error && (
          <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            {!photo ? (
              <button 
                type="button"
                onClick={handleCapture}
                style={{ 
                  width: '64px', height: '64px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--color-primary)', 
                  border: '4px solid rgba(30, 58, 138, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <Camera size={28} />
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={handleRetake}>
                  <RefreshCw size={20} /> Tentar Novamente
                </button>
                <button type="button" className="btn btn-accent" style={{ flex: 1 }} onClick={handleConfirm}>
                  <Check size={20} /> Usar Foto
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
}
