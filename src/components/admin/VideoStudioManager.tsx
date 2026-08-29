import React, { useState } from 'react';
import { 
  Video, Plus, Search, Play, Trash2, Edit3, ExternalLink, Sparkles, 
  Clock, CheckCircle2, AlertCircle, Eye, ShieldCheck, RefreshCw, X,
  Film, Layers, HelpCircle, Scissors
} from 'lucide-react';
import { WpVideo } from '../../types/wordpress';
import { UserRole } from '../../types/admin';
import { 
  extractYouTubeVideoId, 
  fetchYouTubeMetadata, 
  saveVideo, 
  deleteVideo 
} from '../../services/videoService';
import { cleanDescriptionHashtags } from '../../utils/newsStorage';

interface VideoStudioManagerProps {
  videos: WpVideo[];
  onRefreshVideos: () => void;
  onSelectVideo?: (video: WpVideo) => void;
  userRole?: UserRole;
}

const VIDEO_CATEGORIES = [
  'Documentaries & Deep Dives',
  'Explainers & Analysis',
  'Ground Report',
  'Prime Interviews',
  'Business & Economy',
  'Politics & Governance',
  'Technology & Future',
  'Newsroom Shorts',
];

export const VideoStudioManager: React.FC<VideoStudioManagerProps> = ({
  videos,
  onRefreshVideos,
  onSelectVideo,
  userRole = 'editor',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<WpVideo | null>(null);

  // Form State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(VIDEO_CATEGORIES[0]);
  const [duration, setDuration] = useState('5:00');
  const [presenter, setPresenter] = useState('NP Newsroom Special Bureau');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // UI state
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashtagsRemovedCount, setHashtagsRemovedCount] = useState<number | null>(null);
  const [previewModalVideo, setPreviewModalVideo] = useState<WpVideo | null>(null);

  // Filtered list of videos
  const filteredVideos = videos.filter((v) => {
    const matchesSearch = 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.caption && v.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || v.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingVideo(null);
    setYoutubeUrl('');
    setVideoId('');
    setTitle('');
    setDescription('');
    setCategory(VIDEO_CATEGORIES[0]);
    setDuration('5:00');
    setPresenter('NP Newsroom Special Bureau');
    setThumbnailUrl('');
    setFetchError(null);
    setFetchSuccess(false);
    setHashtagsRemovedCount(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (v: WpVideo) => {
    setEditingVideo(v);
    setYoutubeUrl(v.videoUrl);
    setVideoId(extractYouTubeVideoId(v.videoUrl) || '');
    setTitle(v.title);
    setDescription(cleanDescriptionHashtags(v.caption || ''));
    setCategory(v.category || VIDEO_CATEGORIES[0]);
    setDuration(v.duration || '5:00');
    setPresenter(v.presenter || 'NP Newsroom Special Bureau');
    setThumbnailUrl(v.posterUrl || '');
    setFetchError(null);
    setFetchSuccess(false);
    setHashtagsRemovedCount(null);
    setIsAddModalOpen(true);
  };

  const handleUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    setFetchError(null);
    setFetchSuccess(false);
    const extractedId = extractYouTubeVideoId(url);
    if (extractedId) {
      setVideoId(extractedId);
      setThumbnailUrl(`https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`);
    } else {
      setVideoId('');
    }
  };

  const handleFetchYouTubeDetails = async () => {
    const extractedId = extractYouTubeVideoId(youtubeUrl);
    if (!extractedId) {
      setFetchError('Please enter a valid YouTube video link or 11-digit video ID.');
      return;
    }

    setIsFetchingMetadata(true);
    setFetchError(null);
    try {
      const res = await fetchYouTubeMetadata(youtubeUrl);
      if (res.error || !res.metadata) {
        setFetchError(res.error || 'Failed to retrieve YouTube details.');
      } else {
        const meta = res.metadata;
        setTitle(meta.title || title);
        
        // Strip hashtags automatically from YouTube description
        const rawDesc = meta.description || '';
        const cleanedDesc = cleanDescriptionHashtags(rawDesc);
        const tagsCount = (rawDesc.match(/#[\w\u0900-\u097F-]+/g) || []).length;
        
        setDescription(cleanedDesc);
        if (tagsCount > 0) {
          setHashtagsRemovedCount(tagsCount);
        }
        
        setThumbnailUrl(meta.thumbnailUrl);
        setDuration(meta.durationFormatted || '5:00');
        if (meta.channelName) {
          setPresenter(meta.channelName);
        }
        setFetchSuccess(true);
      }
    } catch (err: any) {
      setFetchError(err?.message || 'Error fetching YouTube video information.');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const handleCleanDescriptionManually = () => {
    const tagsCount = (description.match(/#[\w\u0900-\u097F-]+/g) || []).length;
    const cleaned = cleanDescriptionHashtags(description);
    setDescription(cleaned);
    setHashtagsRemovedCount(tagsCount > 0 ? tagsCount : 0);
  };

  const handleSaveVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalVideoId = extractYouTubeVideoId(youtubeUrl) || videoId;
    if (!finalVideoId) {
      alert('A valid YouTube link or video ID is required.');
      return;
    }
    if (!title.trim()) {
      alert('Video title is required.');
      return;
    }

    // Always clean hashtags from description before saving
    const cleanedDesc = cleanDescriptionHashtags(description);

    setIsSubmitting(true);
    try {
      const parts = duration.split(':');
      let totalSeconds = 300;
      if (parts.length === 2) {
        totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      } else if (parts.length === 3) {
        totalSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
      }

      const res = await saveVideo({
        id: editingVideo ? editingVideo.id : undefined,
        title: title.trim(),
        youtubeUrl: `https://www.youtube.com/watch?v=${finalVideoId}`,
        youtubeVideoId: finalVideoId,
        description: cleanedDesc,
        thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${finalVideoId}/hqdefault.jpg`,
        channelName: presenter.trim() || 'NP Newsroom Special Bureau',
        durationSeconds: totalSeconds,
        categoryName: category,
        status: 'published',
      });

      if (res.error && !res.video) {
        alert(`Failed to save video: ${res.error}`);
        return;
      }

      setIsAddModalOpen(false);
      onRefreshVideos();
      alert(editingVideo ? 'Video updated successfully!' : 'Video published successfully to Homepage and Video Hub!');
    } catch (err: any) {
      alert(`Error saving video: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideoClick = async (v: WpVideo) => {
    if (!window.confirm(`Are you sure you want to remove video "${v.title}"?`)) {
      return;
    }

    const res = await deleteVideo(v.id);
    if (res.success) {
      onRefreshVideos();
      alert('Video successfully removed.');
    } else {
      alert(`Failed to delete video: ${res.error || 'Unknown error'}`);
    }
  };

  const rawHashtagsInDescription = (description.match(/#[\w\u0900-\u097F-]+/g) || []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Video Studio & Explainers
                </h1>
                <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  YouTube News Hub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Curate and publish YouTube news reports, visual documentaries, and policy explainers for Homepage and Video Hub.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add YouTube Video</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
            <span className="text-slate-500 block">Total Videos Published</span>
            <span className="font-serif text-xl font-bold text-slate-900 mt-0.5 block">{videos.length}</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200/70">
            <span className="text-emerald-700 font-semibold block">Live on Homepage</span>
            <span className="font-serif text-xl font-bold text-emerald-900 mt-0.5 block">Top 4 Videos</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200/70">
            <span className="text-blue-700 font-semibold block">Video Hub Destination</span>
            <span className="font-semibold text-blue-900 mt-0.5 block">/videos (All Desks)</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/70">
            <span className="text-amber-800 font-semibold block">Hashtag Filtering</span>
            <span className="font-semibold text-amber-900 mt-0.5 block">Auto-Stripped (#)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search videos by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Desk:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium cursor-pointer"
          >
            <option value="all">All Categories ({videos.length})</option>
            {VIDEO_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((v, idx) => {
          const isTopFour = idx < 4;
          const yId = extractYouTubeVideoId(v.videoUrl);

          return (
            <div
              key={v.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Header with Duration and Live Badges */}
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setPreviewModalVideo(v)}>
                  <img
                    src={v.posterUrl || (yId ? `https://img.youtube.com/vi/${yId}/hqdefault.jpg` : '')}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      if (yId) {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  <span className="absolute bottom-2 right-2 bg-black/85 text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded-sm">
                    {v.duration || '5:00'}
                  </span>

                  {isTopFour && (
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      <span>Homepage Live #{idx + 1}</span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                    <span className="text-red-700 font-semibold uppercase tracking-wider text-[11px]">
                      {v.category}
                    </span>
                    <span>•</span>
                    <span className="truncate">{v.presenter}</span>
                  </div>

                  <h3 className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-red-700 transition-colors">
                    {v.title}
                  </h3>

                  {v.caption && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {v.caption}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewModalVideo(v)}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Preview Video Player"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(v)}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded transition-colors cursor-pointer"
                    title="Edit Video Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteVideoClick(v)}
                    className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded transition-colors cursor-pointer"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={v.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 rounded transition-colors"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredVideos.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-slate-800">No videos found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              No videos matched your filter or search query. Click below to add a YouTube video to the newsroom.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add YouTube Video</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================================
          ADD / EDIT YOUTUBE VIDEO MODAL
          ====================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    {editingVideo ? 'Edit News Video' : 'Add YouTube Video to Newsroom'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Appears in NP Newsroom Video & Explainers section on Homepage and Videos page.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveVideoSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* 1. YouTube URL with Auto-Fetch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  YouTube Video Link / URL <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleFetchYouTubeDetails}
                    disabled={isFetchingMetadata || !youtubeUrl}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingMetadata ? 'animate-spin' : ''}`} />
                    <span>{isFetchingMetadata ? 'Fetching...' : 'Fetch Details'}</span>
                  </button>
                </div>

                {fetchError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fetchError}</span>
                  </p>
                )}

                {fetchSuccess && (
                  <p className="mt-1.5 text-xs text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>YouTube details and thumbnail imported successfully!</span>
                  </p>
                )}
              </div>

              {/* 2. Embedded Video Preview (if video ID exists) */}
              {videoId && (
                <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[16/9] shadow-inner relative border border-slate-800">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                    title="YouTube video player preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* 3. Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Video Headline / Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter clear, compelling news headline..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              {/* 4. Description & Hashtag Stripper */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Description & Editorial Context
                  </label>
                  <button
                    type="button"
                    onClick={handleCleanDescriptionManually}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 px-2 py-0.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors cursor-pointer"
                    title="Remove all #hashtags from description"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>Clean #Hashtags (हैशटैग हटाएं)</span>
                  </button>
                </div>

                {/* Hashtag detection warning pill */}
                {rawHashtagsInDescription.length > 0 && (
                  <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Found <strong>{rawHashtagsInDescription.length} hashtag(s)</strong> ({rawHashtagsInDescription.slice(0, 3).join(' ')}...). They will be automatically removed on save.
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCleanDescriptionManually}
                      className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Strip Now
                    </button>
                  </div>
                )}

                {hashtagsRemovedCount !== null && (
                  <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Removed {hashtagsRemovedCount} hashtag(s) from description. Description is clean!</span>
                  </div>
                )}

                <textarea
                  rows={4}
                  placeholder="Provide program summary, report summary, or ground context (hashtags are automatically stripped)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white resize-y"
                />
              </div>

              {/* 5. Category & Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Desk / Show Format
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  >
                    {VIDEO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Duration (e.g. 5:30)
                  </label>
                  <input
                    type="text"
                    placeholder="MM:SS (e.g., 6:45)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* 6. Presenter / Bureau */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Presenter / Channel Accreditation
                </label>
                <input
                  type="text"
                  placeholder="e.g. NP Newsroom Special Bureau, Investigative Desk"
                  value={presenter}
                  onChange={(e) => setPresenter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !youtubeUrl.trim()}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing...' : (editingVideo ? 'Update Video' : 'Publish to Homepage & Videos Page')}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================================
          WATCH / PREVIEW MODAL
          ====================================================================== */}
      {previewModalVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 w-full max-w-3xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {previewModalVideo.category}
                </span>
              </div>
              <button
                onClick={() => setPreviewModalVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Responsive 16:9 Iframe */}
            <div className="aspect-[16/9] w-full bg-black">
              {(() => {
                const yId = extractYouTubeVideoId(previewModalVideo.videoUrl);
                return yId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${yId}?autoplay=1&rel=0`}
                    title={previewModalVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : null;
              })()}
            </div>

            <div className="p-5 bg-slate-900 text-white">
              <h2 className="font-serif text-lg sm:text-xl font-bold mb-2">
                {previewModalVideo.title}
              </h2>
              {previewModalVideo.caption && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {previewModalVideo.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
