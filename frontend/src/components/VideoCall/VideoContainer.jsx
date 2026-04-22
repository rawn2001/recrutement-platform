// src/components/VideoCall/VideoContainer.jsx
import { useEffect, useRef } from 'react';

const VideoContainer = ({ stream, isLocalStream, isOnCall, style, className }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocalStream}
      style={style}
      className={className}
    />
  );
};

export default VideoContainer;
