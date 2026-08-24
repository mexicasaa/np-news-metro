import React, { useState } from 'react';
import { Youtube, Search, CheckCircle2, AlertCircle, RefreshCw, X, Play, Globe, Tag, Sparkles, Plus } from 'lucide-react';
import { fetchYouTubeMetadata, saveVideo, YouTubeMetadata } from '../../services/videoService';
import { WpVideo } from '../../types/wordpress';

interface YouTubeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoSaved: (video: WpVideo) => void;
}

export const YouTubeManagerModal: React.FC<YouTubeManagerModalProps> = ({
  isOpen,
  onClose,
  onVideoSaved,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);

  // Editable fields for editorial override
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channelName, setChannelName] = useState('');
  const [category, setCategory] = useState('technology');

  if (!isOpen) return null;

  const handleFetch = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a YouTube video URL or ID.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetchYouTubeMetadata(urlInput.trim());
      if (res.error || !res.metadata) {
        setError(res.error || 'Unable to fetch YouTube video metadata.');
        setIsLoading(false);
        return;
      }

      setMetadata(res.metadata);
      setTitle(res.metadata.title);
      setDescription(res.metadata.description);
      setChannelName(res.metadata.channelName);
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Error communicating with YouTube API.');
      setIsLoading(false);
    }
  };

  const handleSave = async (status: 'published' | 'draft') => {
    if (!metadata) return;

    setIsSaving(true);
    setError('');

    const res = await saveVideo({
      title: title || metadata.title,
      youtubeUrl: metadata.youtubeUrl,
      youtubeVideoId: metadata.videoId,
      description: description || metadata.description,
      thumbnailUrl: metadata.thumbnailUrl,
      channelName: channelName || metadata.channelName,
      durationSeconds: metadata.durationSeconds,
      status,
    });

    setIsSaving(false);

    if (res.error || !res.video) {
      setError(res.error || 'Failed to save video to database.');
      return;
    }

    onVideoSaved(res.video);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Top Gradient Banner */}
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              YouTube Video Hub Integration
            </h3>
            <p className="text-xs text-slate-500">
              Paste a YouTube video link to automatically extract metadata and publish to Video Hub.
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              YouTube Video URL or Video ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-red-600 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleFetch}
                disabled={isLoading}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Fetch Metadata</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Video Preview & Override Form */}
          {metadata && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Metadata Extracted Successfully</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Duration: {metadata.durationFormatted}
                </span>
              </div>

              {/* Thumbnail & Video Details */}
              <div className="flex gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 items-start">
                <div className="w-40 aspect-video rounded-lg overflow-hidden relative shrink-0 bg-black">
                  <img src={metadata.thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>
                <div className="text-xs space-y-1 flex-1 min-w-0">
                  <p className="font-bold text-slate-900 line-clamp-2">{metadata.title}</p>
                  <p className="text-slate-500 font-medium">Channel: {metadata.channelName}</p>
                  <p className="text-slate-400 font-mono text-[10px]">ID: {metadata.videoId}</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Editorial Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-red-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Program Overview / Caption
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {metadata && (
            <>
              <button
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={isSaving}
                className="px-5 py-2 bg-editorial-red hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Publishing...' : 'Publish to Video Hub'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
