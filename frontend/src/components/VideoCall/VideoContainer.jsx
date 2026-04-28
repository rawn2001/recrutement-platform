
// src/components/VideoCall/VideoContainer.jsx
import { useEffect, useRef } from 'react';

const VideoContainer = ({ stream, isLocalStream, isOnCall, style, className }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // ✅ Gérer le play() avec gestion d'erreur
      const playVideo = async () => {
        try {
          await videoRef.current.play();
        } catch (err) {
          // Ignorer les erreurs d'interruption normales
          if (err.name !== 'AbortError') {
            console.warn('Video play error:', err);
          }
        }
      };
      
      playVideo();
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocalStream}  // ✅ muted est requis pour autoplay
      style={style}
      className={className}
    />
  );
};

export default VideoContainer;
