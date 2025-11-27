import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppState, AudioMetadata, AIAnalysisResult, WebhookConfig } from './types';
import AudioVisualizer from './components/AudioVisualizer';
import ShareView from './components/ShareView';
import SettingsView from './components/SettingsView';
import { formatTime } from './services/audioUtils';
import { analyzeAudio } from './services/geminiService';
import { Mic, Square, Play, Pause, Sparkles, Send, Trash2, RotateCcw, Wand2, Download, AlertCircle, ArrowRight, Settings, ExternalLink, Volume2 } from 'lucide-react';

// Declare chrome to avoid TypeScript errors when accessing extension APIs
declare const chrome: any;

const MAX_RECORDING_TIME = 60; // seconds

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [time, setTime] = useState(0);
  const [audioData, setAudioData] = useState<AudioMetadata | null>(null);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  
  // Settings State
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load settings on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('dege_webhook_config');
    if (savedConfig) {
      try {
        setWebhookConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSaveSettings = (config: WebhookConfig) => {
    setWebhookConfig(config);
    localStorage.setItem('dege_webhook_config', JSON.stringify(config));
  };

  const openPermissionTab = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
        chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    } else {
        window.open(window.location.href, '_blank');
    }
  };

  // --- Recording Logic ---
  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1, // Mono is usually fine for speech and safer
            sampleRate: 44100
        } 
      });
      setStream(audioStream);
      setPermissionError(false);
      
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Validation: Check if blob is too small (likely silent or failed)
        if (blob.size < 1000) {
             setError("Recording was empty or too short. Please try again.");
             audioStream.getTracks().forEach(track => track.stop());
             setStream(null);
             setAppState(AppState.IDLE);
             return;
        }

        const url = URL.createObjectURL(blob);
        
        setAppState(AppState.PROCESSING);
        
        // Simulate "Optimizing Audio" step
        setTimeout(() => {
            setAudioData({ blob, url, duration: time, timestamp: Date.now() });
            setAppState(AppState.REVIEW);
        }, 1200);
        
        audioStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start(100); 
      setAppState(AppState.RECORDING);
      setTime(0);
      setError(null);
      
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = window.setInterval(() => {
        setTime(prev => {
            if (prev >= MAX_RECORDING_TIME) {
                return prev; 
            }
            return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied.");
      setPermissionError(true);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    if (appState === AppState.RECORDING && time >= MAX_RECORDING_TIME) {
        stopRecording();
    }
  }, [time, appState, stopRecording]);

  // --- Playback Logic ---
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Playback failed", e);
        setError("Playback failed. Check system volume.");
      });
    }
  };

  const onTimeUpdate = () => {
      if (audioRef.current) {
          setPlaybackTime(audioRef.current.currentTime);
      }
  };

  const onAudioEnded = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (audioRef.current) {
          audioRef.current.currentTime = time;
          setPlaybackTime(time);
      }
  };

  // --- AI & Reset Logic ---
  const handleAnalyzeAndShare = async () => {
    if (!audioData) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
        const result = await analyzeAudio(audioData.blob);
        setAnalysis(result);
        setAppState(AppState.SHARING);
    } catch (e: any) {
        console.warn("AI Analysis skipped or failed", e);
        setError(e.message || "Failed to analyze audio.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleShareDirectly = () => {
      setAnalysis(null); 
      setAppState(AppState.SHARING);
  };

  const resetApp = () => {
    if (audioData?.url) URL.revokeObjectURL(audioData.url);
    setAudioData(null);
    setAnalysis(null);
    setTime(0);
    setPlaybackTime(0);
    setError(null);
    setPermissionError(false);
    setAppState(AppState.IDLE);
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (audioData?.url) {
      const a = document.createElement('a');
      a.href = audioData.url;
      a.download = `dege-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // --- Render ---
  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden">
      
      {/* Header */}
      {appState !== AppState.SETTINGS && (
        <div className="p-4 flex items-center justify-between z-10 border-b border-gray-50 bg-white/80 backdrop-blur-sm sticky top-0">
            <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">D</div>
            <h1 className="text-base font-bold text-gray-800">Dege</h1>
            </div>
            <button 
                onClick={() => setAppState(AppState.SETTINGS)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Settings size={18} />
            </button>
        </div>
      )}

      {/* Settings View */}
      {appState === AppState.SETTINGS ? (
          <SettingsView 
            config={webhookConfig} 
            onSave={handleSaveSettings} 
            onClose={() => setAppState(audioData ? AppState.SHARING : AppState.IDLE)} 
          />
      ) : (
        /* Content Area */
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 overflow-y-auto">
            
            {appState === AppState.IDLE && (
            <div className="text-center animate-fade-in-up w-full py-8">
                <div className="mb-8 relative group cursor-pointer flex justify-center" onClick={startRecording}>
                    <div className="absolute inset-0 bg-blue-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500 opacity-50 w-24 h-24 mx-auto"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg relative z-10 group-hover:shadow-blue-500/50 transition-all duration-300">
                    <Mic size={40} />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Tap to Record</h2>
                <p className="text-sm text-gray-500">Capture voice notes instantly.</p>
                {error && (
                <div className="mt-6 flex flex-col items-center">
                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center justify-center gap-2 mb-2">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                    {permissionError && (
                        <button 
                            onClick={openPermissionTab}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                        >
                            <ExternalLink size={12} />
                            Authorize in New Tab
                        </button>
                    )}
                </div>
                )}
            </div>
            )}

            {appState === AppState.RECORDING && (
            <div className="w-full flex flex-col items-center animate-fade-in">
                <div className="mb-4 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Recording</span>
                    </div>
                    <div className={`text-5xl font-mono font-light tabular-nums transition-colors ${time > MAX_RECORDING_TIME - 10 ? 'text-red-500' : 'text-gray-800'}`}>
                        {formatTime(time)}
                    </div>
                </div>
                
                <div className="w-full mb-8 relative">
                    <AudioVisualizer stream={stream} isRecording={true} />
                </div>

                <button 
                onClick={stopRecording}
                className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl hover:bg-red-600 transition-colors"
                >
                <Square size={32} fill="currentColor" />
                </button>
            </div>
            )}

            {appState === AppState.PROCESSING && (
            <div className="w-full flex flex-col items-center justify-center animate-fade-in space-y-4">
                <div className="relative">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                        <Wand2 size={40} className="text-blue-500 animate-pulse" />
                    </div>
                    <svg className="absolute top-0 left-0 w-20 h-20 animate-spin" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e7ff" strokeWidth="4" />
                        <path d="M50 5 A 45 45 0 0 1 95 50" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Optimizing Audio...</h3>
                <p className="text-xs text-gray-500">Checking levels & clarity</p>
            </div>
            )}

            {appState === AppState.REVIEW && audioData && (
            <div className="w-full flex flex-col items-center animate-fade-in space-y-6">
                
                {/* Custom Audio Player UI */}
                <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
                    {/* Hidden Audio Element */}
                    <audio 
                        ref={audioRef} 
                        src={audioData.url} 
                        onTimeUpdate={onTimeUpdate} 
                        onEnded={onAudioEnded}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />
                    
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-mono text-gray-800 mb-2 font-medium tracking-tight">
                            {formatTime(playbackTime)} <span className="text-gray-300 text-xl">/ {formatTime(audioData.duration)}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full flex items-center gap-3 mb-4">
                            <span className="text-[10px] text-gray-400 font-mono">{formatTime(playbackTime)}</span>
                            <input 
                                type="range" 
                                min="0" 
                                max={audioData.duration || 1} 
                                step="0.1"
                                value={playbackTime}
                                onChange={onSeek}
                                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                            />
                            <span className="text-[10px] text-gray-400 font-mono">{formatTime(audioData.duration)}</span>
                        </div>

                        {/* Play Controls */}
                         <button 
                            onClick={togglePlayback}
                            className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform active:scale-95"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1"/>}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-center space-x-3 w-full">
                    <button 
                        onClick={resetApp}
                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-medium"
                    >
                        <Trash2 size={16} /> Delete
                    </button>

                    <button 
                        onClick={handleDownload}
                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-200 hover:bg-green-50 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-medium"
                    >
                        <Download size={16} /> Save
                    </button>
                </div>

                {error && (
                <div className="w-full bg-red-50 border border-red-100 rounded-xl p-3 flex items-start space-x-3 text-left">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                        <p className="text-sm text-red-800 font-medium">Notice</p>
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                    </div>
                </div>
                )}

                <div className="w-full pt-2">
                <button 
                    onClick={handleAnalyzeAndShare}
                    disabled={isAnalyzing}
                    className={`w-full py-3.5 rounded-xl flex items-center justify-center space-x-2 font-semibold shadow-lg transition-all text-sm ${
                        isAnalyzing 
                            ? 'bg-gray-200 text-gray-400' 
                            : error 
                                ? 'bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'
                    }`}
                >
                    {isAnalyzing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                            <span>AI Processing...</span>
                        </>
                    ) : (
                        <>
                            {error ? <RotateCcw size={18} /> : <Send size={18} />}
                            <span>{error ? "Retry AI" : "Share with AI Summary"}</span>
                        </>
                    )}
                </button>

                {error && (
                    <button
                        onClick={handleShareDirectly}
                        className="w-full py-2 mt-2 text-gray-500 hover:text-gray-800 text-xs font-medium flex items-center justify-center space-x-1"
                    >
                        <span>Skip AI & Share</span>
                        <ArrowRight size={12} />
                    </button>
                )}
                </div>
            </div>
            )}

            {appState === AppState.SHARING && (
            <ShareView 
                analysis={analysis} 
                audioDuration={formatTime(audioData?.duration || 0)} 
                audioUrl={audioData?.url}
                audioBlob={audioData?.blob}
                webhookConfig={webhookConfig}
                onReset={resetApp} 
            />
            )}

        </div>
      )}
      
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-100/50 rounded-full filter blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default App;