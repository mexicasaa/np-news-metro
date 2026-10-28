import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Plus, 
  X, 
  Link2,
  LayoutGrid,
  Settings2,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { 
  DirectAd, 
  AdSenseSettings, 
  getDirectAds, 
  saveDirectAd, 
  deleteDirectAd, 
  toggleAdOpenClose, 
  resetAdsToDefaults, 
  getAdSenseSettings, 
  saveAdSenseSettings, 
  DEFAULT_ADSENSE_SETTINGS, 
  getAdsVisibility, 
  toggleZoneVisibility, 
  toggleMasterAds, 
  AdsVisibilityConfig 
} from '../../services/adService';
import { AdRepository } from '../../repositories/supabase/AdRepository';
import { uploadMedia } from '../../services/mediaService';

export interface PositionInfo {
  zone: string;
  positionNumber: number;
  name: string;
  description: string;
  dimensions: string;
}

export const POSITION_MAP: Record<string, PositionInfo> = {
  A1: {
    zone: 'A1',
    positionNumber: 1,
    name: 'Header Top Banner',
    description: 'Top banner on all pages',
    dimensions: '728×90 or Responsive Card',
  },
  A2: {
    zone: 'A2',
    positionNumber: 2,
    name: "Below Editor's Picks",
    description: 'Homepage main stories feed',
    dimensions: '728×90 or Responsive Card',
  },
  A3: {
    zone: 'A3',
    positionNumber: 3,
    name: 'Article Top Sidebar',
    description: 'Top right sidebar next to headline',
    dimensions: '300×250 or 300×600 Poster',
  },
  A4: {
    zone: 'A4',
    positionNumber: 4,
    name: 'Inside Article Story',
    description: 'Native card inside article reading flow',
    dimensions: '300×250 Native Card',
  },
  A5: {
    zone: 'A5',
    positionNumber: 5,
    name: 'Tech News Section',
    description: 'Below Technology news cards',
    dimensions: '300×250 Card',
  },
  A6: {
    zone: 'A6',
    positionNumber: 6,
    name: 'World News Section',
    description: 'Below International news cards',
    dimensions: '300×250 Card',
  },
  A7: {
    zone: 'A7',
    positionNumber: 7,
    name: 'Article Lower Sidebar',
    description: 'Lower sidebar next to reader comments',
    dimensions: '300×250 Card',
  },
  A8: {
    zone: 'A8',
    positionNumber: 8,
    name: 'Opinion & Poll Section',
    description: 'Above editorial opinion & poll',
    dimensions: '300×250 Card',
  },
};

const ZONES_LIST = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];

export const AdManagerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slots' | 'adsense'>('slots');
  const [filterMode, setFilterMode] = useState<'all' | 'live' | 'empty'>('all');
  const [directAds, setDirectAds] = useState<DirectAd[]>([]);
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseSettings>(DEFAULT_ADSENSE_SETTINGS);
  const [visibilityConfig, setVisibilityConfig] = useState<AdsVisibilityConfig>(getAdsVisibility());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDbSynced, setIsDbSynced] = useState<boolean>(true);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<DirectAd | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Body Scroll Lock when modal is open to completely eliminate background sliders
  useEffect(() => {
    if (isModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isModalOpen]);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    setAdSenseConfig(getAdSenseSettings());
    setVisibilityConfig(getAdsVisibility());

    try {
      const cached = getDirectAds();
      setDirectAds(cached);

      const dbAds = await AdRepository.getInstance().getAllDirectAds();
      if (dbAds && dbAds.length > 0) {
        setDirectAds(dbAds);
        setIsDbSynced(true);
      } else {
        setIsDbSynced(true);
      }
    } catch {
      setIsDbSynced(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleSyncEvent = () => loadAllData();
    window.addEventListener('np_ads_synced', handleSyncEvent);
    window.addEventListener('storage', handleSyncEvent);

    return () => {
      window.removeEventListener('np_ads_synced', handleSyncEvent);
      window.removeEventListener('storage', handleSyncEvent);
    };
  }, []);

  // Global Master Toggle
  const handleToggleMaster = () => {
    const next = toggleMasterAds();
    loadAllData();
    showNotice(
      next ? 'All commercial ads are now LIVE on the website.' : 'All commercial ads are now PAUSED across the site.',
      next ? 'success' : 'error'
    );
  };

  // Toggle individual position active/paused
  const handleToggleZone = async (zone: string, id?: string) => {
    const info = POSITION_MAP[zone];
    try {
      const next = await toggleAdOpenClose(zone, id);
      await loadAllData();
      showNotice(
        next 
          ? `${info?.name || 'Position'} is now LIVE on the website.` 
          : `${info?.name || 'Position'} is now PAUSED (hidden).`
      );
    } catch (err: any) {
      showNotice(`Error updating ad: ${err?.message || 'Failed'}`, 'error');
    }
  };

  // Delete ad permanently from Supabase & site
  const handleDeleteAd = async (id: string, zone: string) => {
    const info = POSITION_MAP[zone];
    if (confirm(`Remove advertisement from ${info?.name || 'this position'}? This will delete it from both the website and database.`)) {
      try {
        await deleteDirectAd(id, zone);
        await loadAllData();
        showNotice(`Advertisement for ${info?.name || 'Position'} has been deleted.`);
      } catch (err: any) {
        showNotice(`Delete error: ${err?.message || 'Failed'}`, 'error');
      }
    }
  };

  // Open modal to add ad to a specific position
  const handleOpenAddModal = (zone: string = 'A1') => {
    setUploadError(null);
    setShowUrlInput(false);
    setEditingAd({
      id: '',
      zone,
      advertiserName: '',
      creativeText: '',
      destinationUrl: '',
      mediaUrl: '',
      altText: '',
      ctaText: 'Learn More',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  // Open modal to edit existing ad
  const handleOpenEditModal = (ad: DirectAd) => {
    setUploadError(null);
    setShowUrlInput(Boolean(ad.mediaUrl && ad.mediaUrl.startsWith('http')));
    setEditingAd({ ...ad });
    setIsModalOpen(true);
  };

  // Handle direct file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingAd) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Image size exceeds 20MB. Please use a compressed image.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const preview = URL.createObjectURL(file);
      setEditingAd((prev) => prev ? { ...prev, mediaUrl: preview } : null);

      const res = await uploadMedia(
        file,
        editingAd.advertiserName || `Banner ${editingAd.zone}`,
        'Commercial Media Desk'
      );

      if (res.asset?.url) {
        setEditingAd((prev) => prev ? { ...prev, mediaUrl: res.asset!.url } : null);
      }
    } catch {
      setUploadError('Upload failed. You can paste an image URL instead.');
    } finally {
      setIsUploading(false);
    }
  };

  // Save Ad to Supabase & Live site
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    if (!editingAd.advertiserName.trim()) {
      alert('Please enter a Brand or Advertiser name.');
      return;
    }

    setIsSaving(true);
    try {
      const dbResult = await AdRepository.getInstance().saveCampaignAndPlacement({
        id: editingAd.id || undefined,
        zone: editingAd.zone,
        advertiserName: editingAd.advertiserName.trim(),
        creativeText: editingAd.creativeText.trim(),
        destinationUrl: editingAd.destinationUrl.trim() || '#',
        mediaUrl: editingAd.mediaUrl?.trim() || '',
        altText: editingAd.altText?.trim() || editingAd.advertiserName.trim(),
        isActive: editingAd.isActive,
      });

      saveDirectAd({
        ...editingAd,
        id: dbResult.campaignId || editingAd.id,
        advertiserName: editingAd.advertiserName.trim(),
        creativeText: editingAd.creativeText.trim(),
        destinationUrl: editingAd.destinationUrl.trim() || '#',
        mediaUrl: editingAd.mediaUrl?.trim() || '',
      });

      toggleZoneVisibility(editingAd.zone, editingAd.isActive);

      setIsModalOpen(false);
      await loadAllData();
      const posName = POSITION_MAP[editingAd.zone]?.name || 'Position';
      showNotice(`${posName} saved to Database and published live!`);
    } catch (err: any) {
      alert(`Save error: ${err?.message || 'Database error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Save AdSense settings
  const handleSaveAdSense = () => {
    saveAdSenseSettings(adSenseConfig);
    loadAllData();
    showNotice('Google AdSense configuration saved successfully!');
  };

  const filteredZones = ZONES_LIST.filter((zone) => {
    const ad = directAds.find((a) => a.zone === zone);
    const isShowing = visibilityConfig.masterEnabled && visibilityConfig.zones[zone] !== false && Boolean(ad && ad.isActive);
    if (filterMode === 'live') return isShowing;
    if (filterMode === 'empty') return !ad;
    return true;
  });

  const liveSlotsCount = ZONES_LIST.filter((zone) => {
    const ad = directAds.find((a) => a.zone === zone);
    return visibilityConfig.masterEnabled && visibilityConfig.zones[zone] !== false && Boolean(ad && ad.isActive);
  }).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* ======================================================================
          1. HEADER (SHORT & CLEAR)
          ====================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Website Ad Placements
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isDbSynced ? 'Database Synced' : 'Offline Cache'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage banner images, links, and commercial availability across all 8 website positions.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Master Visibility Switch */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-medium text-slate-600">
              Commercial Ads:
            </span>
            <button
              onClick={handleToggleMaster}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                visibilityConfig.masterEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              title={visibilityConfig.masterEnabled ? 'Click to hide all commercial ads' : 'Click to enable all commercial ads'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  visibilityConfig.masterEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${visibilityConfig.masterEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
              {visibilityConfig.masterEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* New Ad Button */}
          <button
            onClick={() => handleOpenAddModal('A1')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow active:scale-98"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Upload New Banner</span>
          </button>
        </div>
      </div>

      {/* Floating Notice Toast */}
      {notice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================================
          2. NAVIGATION PILLS & QUICK FILTERS
          ====================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
        {/* Main Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'slots'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Website Positions (8)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'slots' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {liveSlotsCount} Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('adsense')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'adsense'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Google AdSense Settings</span>
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'slots' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Show:</span>
            </span>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterMode === 'all' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All (8)
            </button>
            <button
              onClick={() => setFilterMode('live')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterMode === 'live' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Live ({liveSlotsCount})
            </button>
            <button
              onClick={() => setFilterMode('empty')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterMode === 'empty' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Empty ({8 - directAds.length})
            </button>
          </div>
        )}
      </div>

      {/* ======================================================================
          3. TAB 1: ALL 8 POSITIONS (CLEAN CARDS WITH CLEAR POSITION NAMES)
          ====================================================================== */}
      {activeTab === 'slots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredZones.map((zone) => {
            const info = POSITION_MAP[zone];
            const ad = directAds.find((a) => a.zone === zone);
            const isLive = 
              visibilityConfig.masterEnabled && 
              visibilityConfig.zones[zone] !== false && 
              Boolean(ad && ad.isActive);

            return (
              <div
                key={zone}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isLive 
                    ? 'border-emerald-300/80 shadow-xs hover:shadow-md' 
                    : ad 
                    ? 'border-slate-200 hover:border-slate-300 opacity-85' 
                    : 'border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/40'
                }`}
              >
                {/* Card Top: Position Number, Plain Name & Live Switch */}
                <div className="p-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-tight">
                      Position {info.positionNumber}
                    </span>

                    {/* Smooth Toggle Switch (if ad exists) */}
                    {ad ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleZone(zone, ad.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                            isLive ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                          title={isLive ? 'Ad is currently LIVE. Click to hide.' : 'Ad is currently PAUSED. Click to show.'}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-xs ${
                              isLive ? 'translate-x-4.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isLive ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {isLive ? 'Live' : 'Off'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Available
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-sm text-slate-900 truncate" title={info.name}>
                    {info.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5" title={info.description}>
                    {info.description}
                  </p>
                </div>

                {/* Card Middle: Creative Image or Clean Add Box */}
                <div className="p-4 flex-1 flex flex-col justify-center">
                  {ad ? (
                    <div className="space-y-3">
                      {/* Banner Image Preview */}
                      <div 
                        onClick={() => handleOpenEditModal(ad)}
                        className="w-full h-32 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center relative group cursor-pointer"
                      >
                        {ad.mediaUrl ? (
                          <img
                            src={ad.mediaUrl}
                            alt={ad.altText || ad.advertiserName}
                            className="max-h-full max-w-full object-contain block mx-auto transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                            <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                            <span>No banner image</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="px-2.5 py-1 bg-white text-slate-900 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Banner</span>
                          </span>
                        </div>
                      </div>

                      {/* Brand Info */}
                      <div>
                        <div className="font-bold text-xs text-slate-900 truncate" title={ad.advertiserName}>
                          {ad.advertiserName}
                        </div>
                        {ad.destinationUrl && ad.destinationUrl !== '#' && (
                          <a
                            href={ad.destinationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-500 hover:text-slate-800 font-mono flex items-center gap-1 mt-0.5 truncate hover:underline"
                            title={ad.destinationUrl}
                          >
                            <Link2 className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate">{ad.destinationUrl.replace(/^https?:\/\//, '')}</span>
                            <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Clean Empty State Upload Area */
                    <div
                      onClick={() => handleOpenAddModal(zone)}
                      className="w-full h-36 rounded-xl border border-dashed border-slate-300 hover:border-slate-800 hover:bg-slate-50 transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-2 transition-colors">
                        <Upload className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        Upload Ad Banner
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {info.dimensions}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Quick Actions */}
                {ad && (
                  <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenEditModal(ad)}
                      className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAd(ad.id, zone)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                      title="Delete ad from database & site"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================================
          4. TAB 2: GOOGLE ADSENSE SETTINGS
          ====================================================================== */}
      {activeTab === 'adsense' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Google AdSense Monetization
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure publisher credentials and fallbacks for when commercial banners are unfilled.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-900">Google AdSense Network</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Enable automatic Google AdSense units across slots.</div>
            </div>
            <button
              onClick={() => setAdSenseConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                adSenseConfig.enabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                  adSenseConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Publisher Client ID
              </label>
              <input
                type="text"
                value={adSenseConfig.clientId}
                onChange={(e) => setAdSenseConfig({ ...adSenseConfig, clientId: e.target.value })}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-mono text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: ca-pub-6758961188222479</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Display Strategy
              </label>
              <select
                value={adSenseConfig.priority}
                onChange={(e) => setAdSenseConfig({ ...adSenseConfig, priority: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="direct_first">Direct Ads First, AdSense Fallback (Recommended)</option>
                <option value="adsense_first">AdSense First, Direct Ad Fallback</option>
                <option value="direct_only">Direct Ads Only (Disable AdSense)</option>
                <option value="adsense_only">AdSense Only (Disable Direct Ads)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Reset AdSense settings to default?')) {
                  resetAdsToDefaults();
                  loadAllData();
                }
              }}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>

            <button
              onClick={handleSaveAdSense}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Save AdSense Settings
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================
          5. PERFECTLY CENTERED, COMPACT MODAL (PORTAL TO DOCUMENT.BODY)
          - Fixed size (no sliding, no left-docking, no ugly slider)
          - Rock-solid centered with React Portal
          - Scrollbar hidden
          ====================================================================== */}
      {isModalOpen && editingAd && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 leading-tight">
                  {editingAd.id ? 'Edit Advertisement' : 'Upload Advertisement'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Position {POSITION_MAP[editingAd.zone]?.positionNumber} • {POSITION_MAP[editingAd.zone]?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body (Scrollbar completely hidden, tight clean padding) */}
            <form onSubmit={handleSaveAd} className="flex-1 overflow-y-auto hide-scrollbar p-5 space-y-3.5 text-xs">
              
              {/* 1. Target Position Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ad Position on Website
                </label>
                <select
                  value={editingAd.zone}
                  onChange={(e) => setEditingAd({ ...editingAd, zone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                >
                  {ZONES_LIST.map((z) => {
                    const item = POSITION_MAP[z];
                    return (
                      <option key={z} value={z}>
                        Position {item.positionNumber}: {item.name} ({item.description})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 2. Visual Image Upload Box (Compact & Clean) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Banner Image
                </label>

                {uploadError && (
                  <div className="mb-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* If Image Loaded -> Show clean thumbnail preview */}
                {editingAd.mediaUrl ? (
                  <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="w-24 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={editingAd.mediaUrl}
                        alt="Ad preview"
                        className="max-h-full max-w-full object-contain block mx-auto"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Banner Image Ready</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {POSITION_MAP[editingAd.zone]?.dimensions}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border text-slate-700 font-semibold rounded-lg text-[11px] cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAd({ ...editingAd, mediaUrl: '' })}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-[11px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Compact Drag & Drop Area */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-200 hover:border-slate-800 rounded-xl p-3.5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center group"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2 py-2">
                        <RefreshCw className="w-4 h-4 text-slate-800 animate-spin" />
                        <span className="text-xs font-bold text-slate-800">Uploading to Media Storage...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-1.5 transition-colors">
                          <Upload className="w-4 h-4 text-slate-600 group-hover:text-slate-900" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          Click to browse banner image
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG, or WebP ({POSITION_MAP[editingAd.zone]?.dimensions})
                        </span>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    {showUrlInput ? 'Hide URL input' : 'Or paste image URL instead'}
                  </button>
                </div>

                {showUrlInput && (
                  <input
                    type="text"
                    value={editingAd.mediaUrl || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, mediaUrl: e.target.value })}
                    placeholder="https://example.com/banner.png"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg font-mono text-[11px] text-slate-900"
                  />
                )}
              </div>

              {/* 3. Brand Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Brand / Advertiser Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingAd.advertiserName}
                  onChange={(e) => setEditingAd({ ...editingAd, advertiserName: e.target.value })}
                  placeholder="e.g. Reserve Bank of India, Tata Motors, etc."
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              {/* 4. Target Link & Button Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Website Link or Phone
                  </label>
                  <input
                    type="text"
                    value={editingAd.destinationUrl}
                    onChange={(e) => setEditingAd({ ...editingAd, destinationUrl: e.target.value })}
                    placeholder="https://... or tel:9871937299"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={editingAd.ctaText || 'Learn More'}
                    onChange={(e) => setEditingAd({ ...editingAd, ctaText: e.target.value })}
                    placeholder="Learn More / Call Now"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* 5. Live Display Switch */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-xs">Show Ad Live on Website</div>
                  <div className="text-[10px] text-slate-500">Enable to make this banner visible immediately.</div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingAd({ ...editingAd, isActive: !editingAd.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                    editingAd.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                      editingAd.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl cursor-pointer text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-all active:scale-98 text-xs"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5 text-amber-400" />
                      <span>Save & Publish Live</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
