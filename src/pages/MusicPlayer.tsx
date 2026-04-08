// Music Player Page - Solo Leveling Vibe
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getCharacterAssets } from '@/lib/characterAssets';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  List,
  Plus,
  Clock,
  Focus
} from 'lucide-react';

interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration: number;
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [characterImages, setCharacterImages] = useState<{ ayanokoji: string | null; jinwoo: string | null }>({
    ayanokoji: null,
    jinwoo: null
  });
  const animationRef = useRef<number | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    // Load tracks from localStorage
    const savedTracks = localStorage.getItem('hybrid-system-tracks');
    if (savedTracks) {
      setTracks(JSON.parse(savedTracks));
    }
  }, []);

  useEffect(() => {
    setCharacterImages(getCharacterAssets());
    const onFocus = () => setCharacterImages(getCharacterAssets());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setPomodoroActive(false);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime]);

  // Visualizer
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.fillStyle = 'rgba(7, 7, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bars = 64;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height * 0.5;
        const hue = (i / bars) * 60 + 180;
        
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${isPlaying ? 0.8 : 0.3})`;
        ctx.fillRect(
          i * barWidth,
          canvas.height - height,
          barWidth - 2,
          height
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleTrackEnd = () => {
    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      nextTrack();
    }
  };

  const nextTrack = () => {
    if (isShuffling) {
      setCurrentTrackIndex(Math.floor(Math.random() * tracks.length));
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newTracks: Track[] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newTracks.push({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        url,
        duration: 0
      });
    });

    const updatedTracks = [...tracks, ...newTracks];
    setTracks(updatedTracks);
    localStorage.setItem('hybrid-system-tracks', JSON.stringify(updatedTracks));
  };

  const startPomodoro = (minutes: number) => {
    setPomodoroTime(minutes * 60);
    setPomodoroActive(true);
  };

  return (
    <div className={`min-h-screen p-4 pb-24 transition-all duration-500 ${focusMode ? 'bg-black' : ''}`}>
      {/* Background Aura Effect */}
      {isPlaying && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>
      )}

      {/* Header */}
      <motion.header
        className="mb-6 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="text-[var(--primary)]">AUDIO</span>
            <span className="text-[var(--text)]"> SYSTEM</span>
          </h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`p-2 rounded-lg transition-all ${
                focusMode ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <Focus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Visualizer */}
      <motion.div
        className="relative h-48 mb-6 rounded-2xl overflow-hidden glass"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={characterImages.ayanokoji || '/ayanokoji-silhouette.svg'}
            alt="Ayanokoji silhouette"
            className="absolute bottom-0 left-2 h-36 opacity-50"
          />
          <img
            src={characterImages.jinwoo || '/jinwoo-silhouette.svg'}
            alt="Jinwoo silhouette"
            className="absolute bottom-0 right-2 h-40 opacity-55"
          />
        </div>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-full relative z-10"
        />
        
        {/* Overlay when not playing */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-[var(--text-muted)] text-sm">Press play to activate visualizer</p>
          </div>
        )}
      </motion.div>

      {/* Now Playing */}
      <motion.div
        className="glass rounded-2xl p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {currentTrack ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[var(--text)] mb-1 truncate">
                {currentTrack.name}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {currentTrack.artist}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = parseFloat(e.target.value);
                  }
                }}
                className="w-full h-1 bg-[var(--surface)] rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--primary) ${(currentTime / (duration || 1)) * 100}%, var(--surface) ${(currentTime / (duration || 1)) * 100}%)`
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setIsShuffling(!isShuffling)}
                className={`p-2 rounded-lg transition-all ${
                  isShuffling ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={prevTrack}
                className="p-3 rounded-full bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--primary)]/20 transition-all"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-3 rounded-full bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--primary)]/20 transition-all"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-lg transition-all ${
                  isLooping ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                }`}
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-[var(--text-muted)]"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-[var(--surface)] rounded-full appearance-none"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-[var(--text-muted)] mb-4">No tracks loaded</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Music</span>
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Hidden Audio Element */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleTrackEnd}
            onLoadedMetadata={handleTimeUpdate}
          />
        )}
      </motion.div>

      {/* Pomodoro Timer */}
      <motion.div
        className="glass rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--text)]">Focus Timer</span>
        </div>

        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-[var(--primary)] font-mono">
            {formatTime(pomodoroTime)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => startPomodoro(25)}
            className="flex-1 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium"
          >
            25m
          </button>
          <button
            onClick={() => startPomodoro(50)}
            className="flex-1 py-2 rounded-lg bg-[var(--secondary)]/20 text-[var(--secondary)] text-sm font-medium"
          >
            50m
          </button>
          <button
            onClick={() => {
              setPomodoroActive(false);
              setPomodoroTime(25 * 60);
            }}
            className="flex-1 py-2 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </motion.div>

      {/* Playlist */}
      {tracks.length > 0 && (
        <motion.div
          className="glass rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-medium text-[var(--text)]">Playlist</span>
            </div>
            <label className="p-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] cursor-pointer">
              <Plus className="w-4 h-4" />
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setIsPlaying(true);
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  currentTrackIndex === index
                    ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/40'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="text-xs text-[var(--text-muted)] w-6">
                  {currentTrackIndex === index && isPlaying ? '▶' : index + 1}
                </span>
                <div className="flex-1 text-left">
                  <p className={`text-sm truncate ${
                    currentTrackIndex === index ? 'text-[var(--primary)]' : 'text-[var(--text)]'
                  }`}>
                    {track.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
