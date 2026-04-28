// src/components/VideoCall/InterviewAIAnalyzer.jsx
// Analyse AI en arrière-plan pendant l'entretien (candidat uniquement)
// ⚠️ N'AFFICHE RIEN à l'écran — juste envoie les données au backend

import { useEffect, useRef, useCallback } from 'react';

// ⚙️ Configuration — UNE SEULE déclaration par variable !
const ANALYSIS_INTERVAL = 2000;              // Analyse vidéo toutes les 2s
const AUDIO_CHUNK_DURATION = 1;              // Durée chunk audio en secondes (2 = 32000 samples)
const FLASK_API = 'http://127.0.0.1:5003';   // ✅ 127.0.0.1 évite certains soucis CORS

const InterviewAIAnalyzer = ({ localStream, isCandidate, sessionId }) => {
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🎥 Capture et envoi d'un frame (sans affichage)
  const captureAndSendFrame = useCallback(async () => {
    if (!videoRef.current || !isCandidate || !sessionId) return;
    
    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const frameBase64 = canvas.toDataURL('image/jpeg', 0.7);
    
    try {
      await fetch(`${FLASK_API}/api/analyze/frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frame: frameBase64,
          role: 'candidate',
          session_id: sessionId
        })
      });
    } catch (err) {
      console.warn('⚠️ Erreur envoi frame:', err);
    }
  }, [isCandidate, sessionId]);

  // 🎤 Setup enregistrement audio
  const setupAudioAnalysis = useCallback(async () => {
    if (!localStream || !isCandidate) return;
    
    try {
      const audioTrack = localStream.getAudioTracks()[0];
      if (!audioTrack) return;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      const source = audioContextRef.current.createMediaStreamSource(
        new MediaStream([audioTrack])
      );
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      // ✅ Log debug audio
      console.log('🎤 Audio setup:', {
        hasAudioTrack: !!audioTrack,
        sampleRate: audioContextRef.current.sampleRate,
        processorCreated: !!processor
      });
      
      processor.onaudioprocess = (e) => {
  const inputData = e.inputBuffer.getChannelData(0);
  
  // ✅ Log: voir si le callback se déclenche
  console.log('🔊 onaudioprocess:', {
    bufferSize: inputData.length,  // = 4096
    avgVolume: inputData.reduce((a,b) => a + Math.abs(b), 0) / inputData.length,
    hasSignal: inputData.some(v => Math.abs(v) > 0.01)
  });
  
  // ✅ Ajouter les samples au buffer
  audioChunksRef.current.push(new Float32Array(inputData));
  
  // ✅ CALCUL CORRECT : total samples = nombre de chunks × taille de chaque chunk
  const samplesPerChunk = inputData.length;  // = 4096
  const totalSamples = audioChunksRef.current.length * samplesPerChunk;
  const requiredSamples = 16000 * AUDIO_CHUNK_DURATION;  // = 32000 si duration=2
  
  // ✅ Log progression correcte
  const percent = Math.min(100, Math.round((totalSamples / requiredSamples) * 100));
  console.log(`📊 Audio buffer: ${percent}% (${totalSamples}/${requiredSamples} samples)`);
  
  // ✅ Envoi quand le buffer est plein
  if (totalSamples >= requiredSamples) {
    // Prendre exactement requiredSamples
    const neededChunks = Math.ceil(requiredSamples / samplesPerChunk);
    const chunk = new Float32Array(requiredSamples);
    let offset = 0;
    
    for (let i = 0; i < neededChunks && offset < requiredSamples; i++) {
      const src = audioChunksRef.current.shift();  // Prendre et retirer du buffer
      const toCopy = Math.min(src.length, requiredSamples - offset);
      chunk.set(src.subarray(0, toCopy), offset);
      offset += toCopy;
    }
    
    console.log('🚀 Sending audio chunk:', chunk.length);
    sendAudioChunk(chunk);
  }
};
      
    } catch (err) {
      console.warn('⚠️ Erreur setup audio:', err);
    }
  }, [localStream, isCandidate]);

  // 🎤 Envoyer chunk audio au backend
  const sendAudioChunk = async (floatArray) => {
    if (!sessionId) return;
    
    try {
      const wavBuffer = floatToWav(floatArray, 16000);
      const base64Audio = arrayBufferToBase64(wavBuffer);
      
      // ✅ Log avant envoi
      console.log('📤 Envoi audio vers Flask:', {
        sessionId,
        audioLength: base64Audio.length,
        timestamp: new Date().toISOString()
      });
      
      await fetch(`${FLASK_API}/api/analyze/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64Audio,
          role: 'candidate',
          session_id: sessionId
        })
      });
      
      console.log('✅ Audio envoyé avec succès');
      
    } catch (err) {
      console.warn('⚠️ Erreur analyse audio:', err);
    }
  };

  // 🔁 Démarrer l'analyse périodique
  useEffect(() => {
    if (!isCandidate || !localStream || !sessionId) return;
    
    // Setup vidéo
    if (localStream.getVideoTracks()[0]) {
      const video = document.createElement('video');
      video.srcObject = localStream;
      video.muted = true;
      video.playsInline = true;
      video.style.display = 'none'; // Cache la vidéo (analyse silencieuse)
      
      // ✅ Gérer play() avec try/catch
      const setupVideo = async () => {
        try {
          await video.play();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn('⚠️ Video play error:', err);
          }
        }
      };
      setupVideo();
      
      videoRef.current = video;
      
      // Setup audio
      setupAudioAnalysis();
      
      // Interval d'analyse vidéo
      analysisIntervalRef.current = setInterval(captureAndSendFrame, ANALYSIS_INTERVAL);
    }
    
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.pause?.();
      }
    };
  }, [isCandidate, localStream, sessionId, captureAndSendFrame, setupAudioAnalysis]);

  // 🧮 Helper: Float32Array → WAV
  const floatToWav = (float32Array, sampleRate) => {
    const buffer = new ArrayBuffer(44 + float32Array.length * 2);
    const view = new DataView(buffer);
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + float32Array.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, float32Array.length * 2, true);
    
    let offset = 44;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    return buffer;
  };
  
  const writeString = (view, offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // 🎨 Ce composant n'affiche RIEN — analyse silencieuse uniquement
  return null;
};

export default InterviewAIAnalyzer;