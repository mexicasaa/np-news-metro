import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Power, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Globe, 
  Database, 
  Sparkles, 
  Plus, 
  X, 
  Layers, 
  Phone, 
  Link2,
  Check,
  ArrowRight
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
  saveAdsVisibility, 
  isZoneVisible, 
  toggleZoneVisibility, 
  toggleMasterAds, 
  AdsVisibilityConfig 
} from '../../services/adService';
import { AdRepository } from '../../repositories/supabase/AdRepository';
import { uploadMedia } from '../../services/mediaService';

export interface ZonePlacementInfo {
  zone: string;
  name: string;
  pageLocations: string[];
  desktopPosition: string;
  mobilePosition: string;
  defaultFormat: 'card' | 'sidebar' | 'banner';
}

export const ZONE_PLACEMENT_DETAILS: Record<string, ZonePlacementInfo> = {
  A1: {
    zone: 'A1',
    name: 'Strip 1 (Slot 1) & Article Bottom Strip',
    pageLocations: ['Homepage: Below Feature & Editor’s Picks (Column 1)', 'Article Pages: Below Related Stories (Slot 1)'],
    desktopPosition: '4-Card Row (Column 1 of 4)',
    mobilePosition: '2x2 Grid (Top-Left Card)',
    defaultFormat: 'card',
  },
  A2: {
    zone: 'A2',
    name: 'Strip 1 (Slot 2) & Article Bottom Strip',
    pageLocations: ['Homepage: Below Feature & Editor’s Picks (Column 2)', 'Article Pages: Below Related Stories (Slot 2)'],
    desktopPosition: '4-Card Row (Column 2 of 4)',
    mobilePosition: '2x2 Grid (Top-Right Card)',
    defaultFormat: 'card',
  },
  A3: {
    zone: 'A3',
    name: 'Primary Article Right Rail Sidebar',
    pageLocations: ['Standard Article Page', 'Breaking News Page', 'Opinion Page', 'Category Feeds'],
    desktopPosition: 'Right Rail Sidebar (Top position next to headline)',
    mobilePosition: 'Adaptive: Placed below Article Body',
    defaultFormat: 'sidebar',
  },
  A4: {
    zone: 'A4',
    name: 'Strip 1 (Slot 4) & Article Middle Sidebar',
    pageLocations: ['Homepage: Below Feature & Editor’s Picks (Column 4)', 'Article Pages: Below Most Read Briefing'],
    desktopPosition: 'Right Rail Sidebar (Middle) / Homepage Column 4',
    mobilePosition: 'Adaptive: Placed below Most Read',
    defaultFormat: 'card',
  },
  A5: {
    zone: 'A5',
    name: 'Strip 2 (Slot 1) — Below Tech & World',
    pageLocations: ['Homepage: Below Tech & World News (Column 1)', 'Article Pages: Bottom Strip (Slot 3)'],
    desktopPosition: '4-Card Row (Column 1 of 4, Above Metromat)',
    mobilePosition: '2x2 Grid (Bottom-Left Card)',
    defaultFormat: 'card',
  },
  A6: {
    zone: 'A6',
    name: 'Strip 2 (Slot 2) — Below Tech & World',
    pageLocations: ['Homepage: Below Tech & World News (Column 2)', 'Article Pages: Bottom Strip (Slot 4)'],
    desktopPosition: '4-Card Row (Column 2 of 4, Above Metromat)',
    mobilePosition: '2x2 Grid (Bottom-Right Card)',
    defaultFormat: 'card',
  },
  A7: {
    zone: 'A7',
    name: 'Strip 2 (Slot 3) — Lower Sidebar Card',
    pageLocations: ['Homepage: Below Tech & World News (Column 3)', 'Article Pages: Opposite Reader Perspectives'],
    desktopPosition: 'Right Rail Sidebar (Lower) / Homepage Column 3',
    mobilePosition: 'Adaptive: Placed below Reader Perspectives',
    defaultFormat: 'card',
  },
  A8: {
    zone: 'A8',
    name: 'Strip 2 (Slot 4) — Metromat Lead-in',
    pageLocations: ['Homepage: Below Tech & World News (Column 4, Above Metromat Poll)'],
    desktopPosition: '4-Card Row (Column 4 of 4)',
    mobilePosition: '2x2 Grid (Bottom-Right Card)',
    defaultFormat: 'card',
  },
};

const ALL_ZONES = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];

export const AdManagerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'zones' | 'adsense'>('zones');
  const [directAds, setDirectAds] = useState<DirectAd[]>([]);
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseSettings>(DEFAULT_ADSENSE_SETTINGS);
  const [visibilityConfig, setVisibilityConfig] = useState<AdsVisibilityConfig>(getAdsVisibility());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [flashMessage, setFlashMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Image Upload & Direct Ad Creation / Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<DirectAd | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const flashNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setFlashMessage({ text, type });
    setTimeout(() => {
      setFlashMessage(null);
    }, 4500);
  };

  const loadData = async () => {
    setIsLoading(true);
    setAdSenseConfig(getAdSenseSettings());
    setVisibilityConfig(getAdsVisibility());

    try {
      // 1. Fetch real direct ads and placements directly from Supabase Database
      const dbAds = await AdRepository.getInstance().getAllDirectAds();
      const dbPlacements = await AdRepository.getInstance().getAllPlacements();

      setDbConnected(true);

      // Sync visibility switches from Supabase
      if (dbPlacements && dbPlacements.length > 0) {
        const currentVis = getAdsVisibility();
        let changed = false;
        const newZones = { ...currentVis.zones };

        dbPlacements.forEach((p) => {
          if (p.zone && typeof p.is_active === 'boolean') {
            if (newZones[p.zone] !== p.is_active) {
              newZones[p.zone] = p.is_active;
              changed = true;
            }
          }
        });

        if (changed) {
          saveAdsVisibility({ ...currentVis, zones: newZones });
          setVisibilityConfig({ ...currentVis, zones: newZones });
        }
      }

      // Prioritize Supabase DB as the single source of truth
      if (dbAds && dbAds.length > 0) {
        setDirectAds(dbAds as any);
        localStorage.setItem('np_direct_ads', JSON.stringify(dbAds));
      } else {
        const local = getDirectAds();
        setDirectAds(local);
      }
    } catch (err) {
      console.warn('Database load notice, using local cache:', err);
      setDbConnected(false);
      setDirectAds(getDirectAds());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('np_ads_updated', handleUpdate);
    return () => window.removeEventListener('np_ads_updated', handleUpdate);
  }, []);

  // Global Master Toggle (Show / Hide all commercial ads across the entire site)
  const handleToggleMaster = () => {
    const next = toggleMasterAds();
    loadData();
    flashNotice(
      next 
        ? 'Commercial ads ENABLED across the website!' 
        : 'All commercial ads PAUSED and hidden from website.',
      next ? 'success' : 'error'
    );
  };

  // Open / Close Individual Zone Toggle (Synchronizes with Supabase & live website)
  const handleToggleOpenClose = async (zone: string, id?: string) => {
    try {
      const next = await toggleAdOpenClose(zone, id);
      await loadData();
      flashNotice(
        next 
          ? `Ad for Zone ${zone} is now OPEN (Live on Website & Supabase Database)!` 
          : `Ad for Zone ${zone} is now CLOSED (Hidden from Website & Database).`
      );
    } catch (err: any) {
      flashNotice(`Failed to toggle Zone ${zone}: ${err?.message || 'Error'}`, 'error');
    }
  };

  // Delete Ad (Purges from Supabase DB, localStorage, and website)
  const handleDeleteAd = async (id: string, zone: string) => {
    if (confirm(`Are you sure you want to delete the ad for Zone ${zone}? This will permanently remove it from both the website and the database.`)) {
      try {
        await deleteDirectAd(id, zone);
        await loadData();
        flashNotice(`Permanently deleted ad for Zone ${zone} from website and database.`);
      } catch (err: any) {
        flashNotice(`Delete error: ${err?.message || 'Failed to delete ad'}`, 'error');
      }
    }
  };

  // Open Modal for New Ad Creation
  const handleOpenCreateModal = (targetZone: string = 'A1') => {
    setUploadError(null);
    setEditingAd({
      id: '',
      zone: targetZone,
      advertiserName: '',
      creativeText: '',
      destinationUrl: '',
      mediaUrl: '',
      altText: '',
      ctaText: 'Learn More',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      impressionsCount: 0,
      clicksCount: 0,
    });
    setIsModalOpen(true);
  };

  // Open Modal for Editing Existing Ad
  const handleOpenEditModal = (ad: DirectAd) => {
    setUploadError(null);
    setEditingAd({ ...ad });
    setIsModalOpen(true);
  };

  // Handle Image File Selection and Direct Upload to Media Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingAd) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Image file size exceeds 20MB limit. Please choose a compressed image.');
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      // 1. Create instant local object URL for immediate user preview
      const localPreviewUrl = URL.createObjectURL(file);
      setEditingAd((prev) => prev ? { ...prev, mediaUrl: localPreviewUrl } : null);

      // 2. Upload to Cloudflare R2 / Supabase Storage via mediaService
      const uploadRes = await uploadMedia(
        file,
        editingAd.advertiserName || `Commercial Ad Zone ${editingAd.zone}`,
        'Commercial Advertising Desk'
      );

      if (uploadRes.error) {
        setUploadError(`Upload warning: ${uploadRes.error}. Using local media.`);
      } else if (uploadRes.asset?.url) {
        setEditingAd((prev) => prev ? { ...prev, mediaUrl: uploadRes.asset!.url } : null);
      }
    } catch (err: any) {
      console.warn('Image upload error:', err);
      setUploadError('Upload failed, but you can paste a direct image URL below.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save Ad Directly to Supabase Database and Live Website
  const handleSaveAdToDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    if (!editingAd.advertiserName.trim()) {
      alert('Please enter an Advertiser or Brand Name.');
      return;
    }

    setIsSavingToDb(true);
    try {
      // 1. Save directly into Supabase Database (campaigns, ad_creatives, ad_placements, media)
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

      // 2. Save into local direct ads cache & broadcast live event to all tabs
      const savedLocal = saveDirectAd({
        ...editingAd,
        id: dbResult.campaignId || editingAd.id,
        advertiserName: editingAd.advertiserName.trim(),
        creativeText: editingAd.creativeText.trim(),
        destinationUrl: editingAd.destinationUrl.trim() || '#',
        mediaUrl: editingAd.mediaUrl?.trim() || '',
      });

      // 3. Ensure zone visibility reflects the active status
      toggleZoneVisibility(editingAd.zone, editingAd.isActive);

      setIsModalOpen(false);
      await loadData();
      flashNotice(
        `Ad for Zone ${editingAd.zone} (${editingAd.advertiserName}) successfully saved to Supabase Database and published to the website!`
      );
    } catch (err: any) {
      console.error('Error saving ad to DB:', err);
      alert(`Error saving ad: ${err?.message || 'Database error'}`);
    } finally {
      setIsSavingToDb(false);
    }
  };

  // Save AdSense Settings
  const handleSaveAdSense = () => {
    saveAdSenseSettings(adSenseConfig);
    loadData();
    flashNotice('Google AdSense configuration saved and synced across all tabs!');
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all commercial ads and AdSense settings to default factory settings?')) {
      resetAdsToDefaults();
      loadData();
      flashNotice('Reset all ad configurations to factory defaults.');
    }
  };

  // Count active live ads
  const activeAdsCount = ALL_ZONES.filter((z) => {
    const ad = directAds.find((a) => a.zone === z);
    return visibilityConfig.masterEnabled && visibilityConfig.zones[z] !== false && ad && ad.isActive;
  }).length;

  return (
    <div className="space-y-6">
      {/* ======================================================================
          HEADER & STATUS BANNER
          ====================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-gold inline-block"></span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink">
              Ad Operations & Commercial Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted">
            Upload commercial sponsor banners, connect directly with Supabase Database, and manage live website slots.
          </p>
        </div>

        {/* Action Controls & Master Switch */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenCreateModal('A1')}
            className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 text-secondary-gold" />
            <span>Upload New Ad</span>
          </button>

          <button
            onClick={handleToggleMaster}
            className={`px-3 py-2 text-xs font-bold rounded-sm border transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
              visibilityConfig.masterEnabled
                ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
            }`}
            title={visibilityConfig.masterEnabled ? 'Click to pause all commercial ads on website' : 'Click to show commercial ads on website'}
          >
            {visibilityConfig.masterEnabled ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                <span>Pause All Ads</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-white" />
                <span>Enable All Ads</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Flash Message Banner */}
      {flashMessage && (
        <div
          className={`p-3 rounded-sm border flex items-center justify-between gap-2 text-xs font-bold animate-in fade-in duration-200 ${
            flashMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {flashMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{flashMessage.text}</span>
          </div>
          <button
            onClick={() => setFlashMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface-lowest border border-border-subtle rounded-sm p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Database Connection
            </div>
            <div className="text-sm font-bold text-ink flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{dbConnected ? 'Connected to Supabase DB' : 'Local Storage Mode'}</span>
            </div>
          </div>
          <Database className={`w-5 h-5 ${dbConnected ? 'text-emerald-600' : 'text-amber-500'}`} />
        </div>

        <div className="bg-surface-lowest border border-border-subtle rounded-sm p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Live Commercial Slots
            </div>
            <div className="text-sm font-bold text-ink mt-0.5">
              <span className="text-primary font-mono text-base">{activeAdsCount}</span> of 8 Zones Showing
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-secondary-gold" />
        </div>

        <div className="bg-surface-lowest border border-border-subtle rounded-sm p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Website Visibility Master
            </div>
            <div className="text-sm font-bold mt-0.5 flex items-center gap-1.5">
              <span className={visibilityConfig.masterEnabled ? 'text-emerald-700' : 'text-rose-600'}>
                {visibilityConfig.masterEnabled ? 'Commercial Ads Live' : 'All Ads Master Paused'}
              </span>
            </div>
          </div>
          <Power className={`w-5 h-5 ${visibilityConfig.masterEnabled ? 'text-emerald-600' : 'text-rose-500'}`} />
        </div>
      </div>

      {/* ======================================================================
          SIMPLIFIED TABS NAVIGATION (2 TABS ONLY)
          ====================================================================== */}
      <div className="border-b border-border-subtle flex items-center gap-2">
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'zones'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-ink-secondary hover:text-ink hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All 8 Website Ad Zones (A1 — A8)</span>
        </button>

        <button
          onClick={() => setActiveTab('adsense')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'adsense'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-ink-secondary hover:text-ink hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Google AdSense Settings</span>
        </button>
      </div>

      {/* ======================================================================
          TAB 1: ALL 8 AD ZONES (VISUAL COMMAND CENTER)
          ====================================================================== */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Click any zone to upload a banner, edit details, or toggle live status on the website.</span>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="text-primary hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh from Database</span>
            </button>
          </div>

          {/* Grid of 8 Zone Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_ZONES.map((zone) => {
              const locationInfo = ZONE_PLACEMENT_DETAILS[zone];
              const ad = directAds.find((a) => a.zone === zone);
              const isZoneShowing = 
                visibilityConfig.masterEnabled && 
                (visibilityConfig.zones[zone] !== false) && 
                Boolean(ad && ad.isActive);

              return (
                <div
                  key={zone}
                  className={`bg-surface-lowest border rounded-sm p-3.5 shadow-2xs flex flex-col justify-between transition-all ${
                    isZoneShowing
                      ? 'border-border-subtle hover:border-primary/50'
                      : ad
                      ? 'border-amber-200 bg-amber-50/20 opacity-90'
                      : 'border-dashed border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div>
                    {/* Zone Badge & Status Indicator */}
                    <div className="flex items-center justify-between pb-2 border-b border-border-subtle/60 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-xs bg-primary text-white text-[10px] font-mono font-bold">
                          ZONE {zone}
                        </span>
                        <span className="text-[10px] font-mono text-ink-muted">
                          {locationInfo.defaultFormat.toUpperCase()}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isZoneShowing
                            ? 'bg-emerald-100 text-emerald-800'
                            : ad
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isZoneShowing ? 'bg-emerald-600 animate-pulse' : ad ? 'bg-amber-600' : 'bg-slate-400'
                          }`}
                        ></span>
                        <span>{isZoneShowing ? 'LIVE ON SITE' : ad ? 'OFF (PAUSED)' : 'EMPTY'}</span>
                      </span>
                    </div>

                    {/* Zone Location Description */}
                    <div className="mb-3">
                      <h3 className="font-bold text-xs text-ink line-clamp-1" title={locationInfo.name}>
                        {locationInfo.name}
                      </h3>
                      <p className="text-[10px] text-ink-muted line-clamp-1 mt-0.5">
                        {locationInfo.desktopPosition}
                      </p>
                    </div>

                    {/* Creative Media Preview Box */}
                    {ad ? (
                      <div className="space-y-2 mb-3">
                        {/* Image Preview */}
                        <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded border border-border-subtle/80 overflow-hidden flex items-center justify-center relative group">
                          {ad.mediaUrl ? (
                            <img
                              src={ad.mediaUrl}
                              alt={ad.altText || ad.advertiserName}
                              className="max-h-full max-w-full object-contain block mx-auto transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 text-[10px]">
                              <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                              <span>Text-only Banner</span>
                            </div>
                          )}

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(ad)}
                              className="px-2 py-1 bg-white text-slate-900 text-[10px] font-bold rounded cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Change</span>
                            </button>
                            {ad.destinationUrl && ad.destinationUrl !== '#' && (
                              <a
                                href={ad.destinationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-white text-slate-900 rounded cursor-pointer"
                                title="Open Link"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Advertiser Details */}
                        <div>
                          <div className="font-bold text-xs text-ink truncate" title={ad.advertiserName}>
                            {ad.advertiserName}
                          </div>
                          <p className="text-[11px] text-ink-secondary line-clamp-2 leading-snug mt-0.5">
                            {ad.creativeText || 'No description entered.'}
                          </p>
                          {ad.destinationUrl && ad.destinationUrl !== '#' && (
                            <div className="text-[10px] text-primary truncate font-mono mt-1 flex items-center gap-1">
                              <Link2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">{ad.destinationUrl}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Empty Zone Box */
                      <div
                        onClick={() => handleOpenCreateModal(zone)}
                        className="w-full h-36 border border-dashed border-slate-300 rounded hover:border-primary/60 hover:bg-primary/5 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer mb-3 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center mb-1.5 transition-colors">
                          <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">
                          + Add Ad for Zone {zone}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Upload image banner & connect to DB
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between gap-1.5">
                    {ad ? (
                      <>
                        {/* Prominent OPEN / CLOSE Toggle Button */}
                        <button
                          onClick={() => handleToggleOpenClose(zone, ad.id)}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer flex-1 justify-center border shadow-2xs ${
                            isZoneShowing
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                          }`}
                          title={isZoneShowing ? 'Click to HIDE this ad from website' : 'Click to SHOW this ad on live website'}
                        >
                          <Power className="w-3 h-3" />
                          <span>{isZoneShowing ? 'OPEN (LIVE)' : 'CLOSED (OFF)'}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(ad)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors cursor-pointer border border-slate-200"
                          title="Edit Ad Details / Change Image"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteAd(ad.id, zone)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer border border-slate-200"
                          title="Delete Ad from Database & Website"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenCreateModal(zone)}
                        className="w-full py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Banner</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 2: GOOGLE ADSENSE SETTINGS
          ====================================================================== */}
      {activeTab === 'adsense' && (
        <div className="bg-surface-lowest border border-border-subtle rounded-sm p-5 shadow-2xs space-y-5 max-w-3xl">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="font-serif text-lg font-bold text-ink">
              Google AdSense Monetization
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Configure AdSense publisher credentials, priority routing, and zone fallbacks.
            </p>
          </div>

          {/* Master AdSense Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-border-subtle">
            <div>
              <div className="text-xs font-bold text-ink">Google AdSense Network Status</div>
              <div className="text-[11px] text-ink-muted">Master switch to enable or disable AdSense tags across the site.</div>
            </div>
            <button
              onClick={() => setAdSenseConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                adSenseConfig.enabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {adSenseConfig.enabled ? 'AdSense Enabled' : 'AdSense Disabled'}
            </button>
          </div>

          {/* Publisher ID & Inventory Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                AdSense Publisher Client ID
              </label>
              <input
                type="text"
                value={adSenseConfig.clientId}
                onChange={(e) => setAdSenseConfig({ ...adSenseConfig, clientId: e.target.value })}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded text-xs font-mono text-ink"
              />
              <span className="text-[10px] text-ink-muted">Default: ca-pub-6758961188222479</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Monetization Routing Priority
              </label>
              <select
                value={adSenseConfig.priority}
                onChange={(e) => setAdSenseConfig({ ...adSenseConfig, priority: e.target.value as any })}
                className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded text-xs text-ink font-bold"
              >
                <option value="direct_first">Direct Ads First (AdSense Fallback) — Recommended</option>
                <option value="adsense_first">AdSense First (Direct Ad Fallback)</option>
                <option value="direct_only">Direct Ads Only (Never Show AdSense)</option>
                <option value="adsense_only">AdSense Only (Never Show Direct Ads)</option>
              </select>
            </div>
          </div>

          {/* Zone Fallback Matrix */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">
              AdSense Fallback Enabled per Zone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALL_ZONES.map((zone) => {
                const zoneCfg = adSenseConfig.zones[zone];
                const isEnabled = zoneCfg ? zoneCfg.enabled : true;

                return (
                  <label
                    key={zone}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-xs ${
                      isEnabled ? 'bg-emerald-50/50 border-emerald-300 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAdSenseConfig({
                          ...adSenseConfig,
                          zones: {
                            ...adSenseConfig.zones,
                            [zone]: {
                              ...(adSenseConfig.zones[zone] || { slotId: `slot-${zone}`, format: 'rectangle' }),
                              enabled: checked,
                            },
                          },
                        });
                      }}
                      className="rounded text-primary"
                    />
                    <span>Zone {zone}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Save / Reset Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
            <button
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Reset to Factory Defaults
            </button>

            <button
              onClick={handleSaveAdSense}
              className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-secondary-gold" />
              <span>Save AdSense Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================
          EASY IMAGE UPLOAD & AD CREATOR MODAL (Direct DB Connection)
          ====================================================================== */}
      {isModalOpen && editingAd && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-lowest border border-border-subtle rounded-md shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  {editingAd.id ? `Edit Ad for Zone ${editingAd.zone}` : `Upload New Ad for Zone ${editingAd.zone}`}
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Upload an image banner, fill details, and connect directly with Supabase Database.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdToDatabase} className="space-y-4 text-xs">
              
              {/* Target Zone Selection */}
              <div>
                <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                  1. Select Target Website Zone *
                </label>
                <select
                  value={editingAd.zone}
                  onChange={(e) => setEditingAd({ ...editingAd, zone: e.target.value })}
                  className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded font-bold text-ink"
                >
                  {ALL_ZONES.map((z) => (
                    <option key={z} value={z}>
                      Zone {z} — {ZONE_PLACEMENT_DETAILS[z]?.name} ({ZONE_PLACEMENT_DETAILS[z]?.desktopPosition})
                    </option>
                  ))}
                </select>
              </div>

              {/* IMAGE UPLOAD & PREVIEW AREA */}
              <div>
                <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                  2. Upload Ad Banner / Creative Image *
                </label>

                {/* Upload Error Banner */}
                {uploadError && (
                  <div className="mb-2 p-2 bg-rose-50 border border-rose-300 rounded text-[11px] text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* If Image exists, show preview with change button */}
                {editingAd.mediaUrl ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border rounded space-y-2">
                    <div className="w-full h-40 bg-slate-200 dark:bg-slate-900 rounded overflow-hidden flex items-center justify-center p-2 relative">
                      <img
                        src={editingAd.mediaUrl}
                        alt="Ad Banner Preview"
                        className="max-h-full max-w-full object-contain block mx-auto"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Image Ready</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border text-slate-700 font-bold rounded cursor-pointer"
                        >
                          Change File
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAd({ ...editingAd, mediaUrl: '' })}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Drag and Drop / File Input Box */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-primary rounded-lg p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-primary/5 flex flex-col items-center justify-center"
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center space-y-2 py-3">
                        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                        <span className="text-xs font-bold text-primary">Uploading to Media Storage...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-ink">
                          Click to select an image from your computer
                        </span>
                        <span className="text-[10px] text-ink-muted mt-1">
                          PNG, JPG, WebP, or GIF (Recommended: 300x250 or 728x90)
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Hidden Native File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Manual Image URL Input (Fallback) */}
                <div className="mt-2">
                  <div className="text-[10px] text-ink-muted mb-0.5">Or paste direct image URL:</div>
                  <input
                    type="text"
                    value={editingAd.mediaUrl || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, mediaUrl: e.target.value })}
                    placeholder="https://example.com/banner.png or /uploads/..."
                    className="w-full bg-surface-container border border-border-subtle px-2.5 py-1.5 rounded font-mono text-[11px] text-ink"
                  />
                </div>
              </div>

              {/* ADVERTISER & HEADLINE */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                    3. Advertiser / Sponsor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAd.advertiserName}
                    onChange={(e) => setEditingAd({ ...editingAd, advertiserName: e.target.value })}
                    placeholder="e.g. Reserve Bank of India / Commercial Sponsor"
                    className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded text-ink font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                    4. Ad Headline & Description Copy
                  </label>
                  <textarea
                    rows={2}
                    value={editingAd.creativeText}
                    onChange={(e) => setEditingAd({ ...editingAd, creativeText: e.target.value })}
                    placeholder="Brief message, initiative notice, or offer description..."
                    className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded text-ink"
                  />
                </div>
              </div>

              {/* DESTINATION LINK & BUTTON TEXT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                    5. Target URL or Phone
                  </label>
                  <input
                    type="text"
                    value={editingAd.destinationUrl}
                    onChange={(e) => setEditingAd({ ...editingAd, destinationUrl: e.target.value })}
                    placeholder="https://... or tel:9871937299"
                    className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded text-ink font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={editingAd.ctaText || 'Learn More'}
                    onChange={(e) => setEditingAd({ ...editingAd, ctaText: e.target.value })}
                    placeholder="Learn More / Call Now"
                    className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded text-ink"
                  />
                </div>
              </div>

              {/* INITIAL STATUS SWITCH */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="font-bold text-ink text-xs">Live Display Status</div>
                  <div className="text-[10px] text-ink-muted">Set whether this ad should appear on the website immediately.</div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingAd({ ...editingAd, isActive: !editingAd.isActive })}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    editingAd.isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{editingAd.isActive ? 'Active (Live)' : 'Paused (Hidden)'}</span>
                </button>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingToDb}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-all"
                >
                  {isSavingToDb ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-secondary-gold" />
                      <span>Saving to Supabase Database...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-secondary-gold" />
                      <span>Save Ad to Database & Publish</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
