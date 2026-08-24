import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { WpVideo } from '../../types/wordpress';
import { useLanguage } from '../../context/LanguageContext';
import { extractYouTubeVideoId } from '../../services/videoService';

interface VideoPlayerProps {
  video: WpVideo;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isHindi } = useLanguage();

  const youtubeId = extractYouTubeVideoId(video.videoUrl);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="my-6 bg-black rounded-sm overflow-hidden border border-border-subtle shadow-md">
      {/* Video Viewport */}
      <div className="relative aspect-[16/9] w-full bg-black group">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.posterUrl}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              onEnded={() => setIsPlaying(false)}
              playsInline
            />

            {/* Big Center Play Button when paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group-hover:bg-black/30 transition-colors"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-editorial-red text-white flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
            )}

            {/* Custom Video Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-editorial-red" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span className="font-mono text-xs text-slate-300">
                  {isPlaying ? (isHindi ? '???????? ?? ??? ??' : 'Playing') : '00:00'} / {video.duration}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                  title={isHindi ? '????? ???????' : 'Fullscreen'}
                  aria-label={isHindi ? '????? ???????' : 'Fullscreen'}
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Video Details & Caption Bar */}
      <div className="p-4 bg-primary text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-secondary-gold tracking-wider block">
            {video.category} • {isHindi ? `?????????: ${video.presenter}` : `Presented by ${video.presenter}`}
          </span>
          <p className="text-slate-300 text-xs mt-0.5">{video.caption}</p>
        </div>

        <div className="flex items-center gap-2">
          {video.transcript && video.transcript.length > 0 && (
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-1.5 bg-primary-container hover:bg-primary-light text-white px-3 py-1.5 rounded-sm border border-slate-600 transition-colors flex-shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-secondary-gold" />
              <span>
                {showTranscript
                  ? (isHindi ? '????????????? ??????' : 'Hide Transcript')
                  : (isHindi ? '???? ????????????? ?????' : 'View Full Transcript')}
              </span>
              {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Accordion Transcript Box */}
      {showTranscript && video.transcript && (
        <div className="p-5 bg-surface-lowest border-t border-border-subtle text-xs text-ink-secondary space-y-3 animate-fadeIn">
          <div className="font-bold text-xs uppercase tracking-wider text-primary border-b border-border-subtle pb-1">
            {isHindi ? '???-??????? ?????? ?????????????' : 'Timestamped Video Transcript'}
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {video.transcript.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="font-mono font-bold text-secondary text-xs flex-shrink-0">
                  [{item.time}]
                </span>
                <p className="leading-relaxed text-ink">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
