import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Globe, 
  Eye, 
  EyeOff,
  MousePointer, 
  TrendingUp, 
  ExternalLink, 
  Phone, 
  Sliders, 
  Activity, 
  Layers, 
  Check, 
  X, 
  Save, 
  HelpCircle,
  Sparkles,
  Info,
  MapPin,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Power
} from 'lucide-react';
import { 
  DirectAd, 
  AdSenseSettings, 
  DiagnosticReport, 
  getDirectAds, 
  saveDirectAd, 
  deleteDirectAd, 
  toggleDirectAdStatus, 
  toggleAdOpenClose,
  resetAdsToDefaults, 
  getAdSenseSettings, 
  saveAdSenseSettings, 
  runAdSenseDiagnosticTests, 
  getAggregatedAdStats,
  DEFAULT_ADSENSE_SETTINGS,
  getAdsVisibility,
  saveAdsVisibility,
  isZoneVisible,
  toggleZoneVisibility,
  toggleMasterAds,
  AdsVisibilityConfig
} from '../../services/adService';
import { AdSlot } from '../commercial/AdSlot';

export interface ZonePlacementInfo {
  zone: string;
  name: string;
  pageLocations: string[];
  desktopPosition: string;
  mobilePosition: string;
  defaultFormat: 'card' | 'sidebar' | 'inline' | 'banner';
}

export const ZONE_PLACEMENT_DETAILS: Record<string, ZonePlacementInfo> = {
  A1: {
    zone: 'A1',
    name: 'Strip 1 (Slot 1) & Article Bottom Strip',
    pageLocations: ['Homepage: Below Feature & Editor’s Picks', 'Article Pages: Below Related Stories (Slot 1)'],
    desktopPosition: '4-Card Row (Column 1 of 4)',
    mobilePosition: '2x2 Grid (Top-Left Card)',
    defaultFormat: 'card',
  },
  A2: {
    zone: 'A2',
    name: 'Strip 1 (Slot 2) & Article Bottom Strip',
    pageLocations: ['Homepage: Below Feature & Editor’s Picks', 'Article Pages: Below Related Stories (Slot 2)'],
    desktopPosition: '4-Card Row (Column 2 of 4)',
    mobilePosition: '2x2 Grid (Top-Right Card)',
    defaultFormat: 'card',
  },
  A3: {
    zone: 'A3',
    name: 'Primary Top Right Rail Sidebar',
    pageLocations: ['Standard Article Page', 'Breaking News Page', 'Opinion Page', 'Latest News & Category Feeds'],
    desktopPosition: 'Right Rail Sidebar (Next to Article Title & Story Intro)',
    mobilePosition: 'Adaptive: Moves down immediately below Article Body',
    defaultFormat: 'sidebar',
  },
  A4: {
    zone: 'A4',
    name: 'Strip 1 (Slot 4) & Article Middle Sidebar',
    pageLocations: ['Homepage: Below Feature & Editor’s Picks (Slot 4)', 'Article Pages: Below Most Read & Morning Dispatch'],
    desktopPosition: 'Right Rail Sidebar (Below Most Read & Briefing)',
    mobilePosition: 'Adaptive: Moves down below Most Read & Morning Dispatch',
    defaultFormat: 'card',
  },
  A5: {
    zone: 'A5',
    name: 'Strip 2 (Slot 1) & Article Bottom Strip',
    pageLocations: ['Homepage: Below Tech & World News', 'Article Pages: Below Related Stories (Slot 3)'],
    desktopPosition: '4-Card Row (Column 1 of 4, Above Metromat)',
    mobilePosition: '2x2 Grid (Bottom-Left Card)',
    defaultFormat: 'card',
  },
  A6: {
    zone: 'A6',
    name: 'Strip 2 (Slot 2) & Article Bottom Strip',
    pageLocations: ['Homepage: Below Tech & World News', 'Article Pages: Below Related Stories (Slot 4)'],
    desktopPosition: '4-Card Row (Column 2 of 4, Above Metromat)',
    mobilePosition: '2x2 Grid (Bottom-Right Card)',
    defaultFormat: 'card',
  },
  A7: {
    zone: 'A7',
    name: 'Strip 2 (Slot 3) & Article Lower Sidebar',
    pageLocations: ['Homepage: Below Tech & World News (Slot 3)', 'Article Pages: Opposite Reader Comments'],
    desktopPosition: 'Right Rail Sidebar (Opposite Reader Comments)',
    mobilePosition: 'Adaptive: Moves down below Reader Perspectives & Comments',
    defaultFormat: 'card',
  },
  A8: {
    zone: 'A8',
    name: 'Strip 2 (Slot 4) - Metromat Lead-in',
    pageLocations: ['Homepage: Below Tech & World News (Slot 4, Above Metromat Poll)'],
    desktopPosition: '4-Card Row (Column 4 of 4)',
    mobilePosition: '2x2 Grid (Bottom-Right Card)',
    defaultFormat: 'card',
  },
};

const ZONE_DESCRIPTIONS: Record<string, string> = {
  A1: 'Top 4-Ad Strip (Slot 1) & Article Bottom Strip',
  A2: 'Top 4-Ad Strip (Slot 2) & Article Bottom Strip',
  A3: 'Right Rail Sidebar Top (Article & Public Feed Pages)',
  A4: 'In-Article Native Placement & Middle Sidebar Card',
  A5: 'Bottom 4-Ad Strip (Slot 1) & Article Bottom Strip',
  A6: 'Bottom 4-Ad Strip (Slot 2) & Sticky Dispatch',
  A7: 'Bottom 4-Ad Strip (Slot 3) & Lower Sidebar Card',
  A8: 'Bottom 4-Ad Strip (Slot 4) & Feed Bottom Strip',
};

const SAMPLE_IMAGE_OPTIONS = [
  { label: 'Suresh Chand Agarwal Memorial', value: '/uploads/ads/suresh-chand-agarwal-memorial.png' },
  { label: 'Shastri Patanjali Chikitsalaya', value: '/uploads/ads/shastri-patanjali-chikitsalaya.jpg' },
  { label: 'NP News Metro Official Logo', value: '/logo.png' },
  { label: 'Sugarcane Ethanol Initiative', value: '/uploads/sugarcane-ethanol-future-featured.jpg' },
  { label: 'National Culture / Janmashtami', value: '/uploads/iskcon-noida-janmashtami-2026.jpg' },
];

export const AdManagerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'direct' | 'adsense' | 'placement' | 'diagnostics' | 'preview'>('direct');
  const [directAds, setDirectAds] = useState<DirectAd[]>([]);
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseSettings>(DEFAULT_ADSENSE_SETTINGS);
  const [visibilityConfig, setVisibilityConfig] = useState<AdsVisibilityConfig>(getAdsVisibility());
  const [diagnostics, setDiagnostics] = useState<DiagnosticReport | null>(null);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState<boolean>(false);
  const [stats, setStats] = useState({ totalImpressions: 0, totalClicks: 0, ctr: 0 });

  // Modal State for Create / Edit
  const [editingAd, setEditingAd] = useState<DirectAd | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Live Sandbox Preview State
  const [previewZone, setPreviewZone] = useState<string>('A1');
  const [previewVariant, setPreviewVariant] = useState<'card' | 'banner' | 'sidebar'>('card');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [wireframeMode, setWireframeMode] = useState<'homepage' | 'article'>('homepage');

  const loadData = () => {
    setDirectAds(getDirectAds());
    setAdSenseConfig(getAdSenseSettings());
    setVisibilityConfig(getAdsVisibility());
    setStats(getAggregatedAdStats());
  };

  useEffect(() => {
    loadData();
    handleRunDiagnostics();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('np_ads_updated', handleUpdate);
    return () => window.removeEventListener('np_ads_updated', handleUpdate);
  }, []);

  const handleToggleMaster = () => {
    const next = toggleMasterAds();
    loadData();
    flashSuccess(next ? 'Commercial ads ENABLED across the website!' : 'All commercial ads PAUSED and hidden from website.');
  };

  const handleToggleOpenClose = async (zone: string, id?: string) => {
    const next = await toggleAdOpenClose(zone, id);
    loadData();
    flashSuccess(
      next 
        ? `Ad for Zone ${zone} is now OPEN (Live on Website & Database)!` 
        : `Ad for Zone ${zone} is now CLOSED (Hidden from Website & Database).`
    );
  };

  const handleToggleZoneVisibility = async (zone: string) => {
    await handleToggleOpenClose(zone);
  };

  const handleRunDiagnostics = async () => {
    setLoadingDiagnostics(true);
    try {
      const report = await runAdSenseDiagnosticTests();
      setDiagnostics(report);
    } catch (err) {
      console.error('Failed to run diagnostics:', err);
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  const handleOpenCreateModal = (presetZone?: string) => {
    const newAd: DirectAd = {
      id: '',
      zone: presetZone || 'A1',
      advertiserName: '',
      creativeText: '',
      destinationUrl: '',
      mediaUrl: '',
      altText: '',
      ctaText: 'Learn More',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingAd(newAd);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ad: DirectAd) => {
    setEditingAd({ ...ad });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    if (!editingAd.advertiserName.trim()) {
      alert('Advertiser name is required.');
      return;
    }

    saveDirectAd(editingAd);
    setIsModalOpen(false);
    setEditingAd(null);
    loadData();
    flashSuccess(`Ad for Zone ${editingAd.zone} saved successfully!`);
  };

  const handleDelete = async (id: string, zone: string) => {
    if (confirm(`Are you sure you want to delete the direct ad for Zone ${zone}? This will permanently remove it from both the website and the database.`)) {
      await deleteDirectAd(id, zone);
      loadData();
      flashSuccess(`Permanently deleted direct ad for Zone ${zone} from website and database.`);
    }
  };

  const handleToggleStatus = (id: string, current: boolean) => {
    toggleDirectAdStatus(id, !current);
    loadData();
  };

  const handleSaveAdSense = () => {
    saveAdSenseSettings(adSenseConfig);
    loadData();
    flashSuccess('Google AdSense configuration saved and synced across all tabs!');
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all direct ads and AdSense settings to default factory settings?')) {
      resetAdsToDefaults();
      loadData();
      handleRunDiagnostics();
      flashSuccess('All ad settings reset to defaults.');
    }
  };

  const flashSuccess = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-ink">
              Ad Operations & Monetization Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Manage first-party sponsor campaigns, orchestrate Google AdSense, and run compliance diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-3.5 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-sm flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Direct Ad</span>
          </button>
          <button
            onClick={handleRunDiagnostics}
            disabled={loadingDiagnostics}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDiagnostics ? 'animate-spin' : ''}`} />
            <span>Run Diagnostics</span>
          </button>
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-sm transition-colors cursor-pointer"
            title="Reset to verified seed defaults"
          >
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-xs font-bold flex items-center gap-2 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-ink-muted text-xs">
            <span className="font-mono uppercase text-[11px]">Active Direct Ads</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <p className="font-serif text-2xl font-bold text-ink mt-1">
            {directAds.filter(a => a.isActive).length} / {directAds.length}
          </p>
          <span className="text-[10px] text-ink-muted">All 8 zones covered</span>
        </div>

        <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-ink-muted text-xs">
            <span className="font-mono uppercase text-[11px]">Google AdSense</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${adSenseConfig.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <p className="font-serif text-xl font-bold text-ink">
              {adSenseConfig.enabled ? 'ACTIVE' : 'DISABLED'}
            </p>
          </div>
          <span className="text-[10px] text-ink-muted capitalize">Priority: {adSenseConfig.priority.replace('_', ' ')}</span>
        </div>

        <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-ink-muted text-xs">
            <span className="font-mono uppercase text-[11px]">Tracked Impressions</span>
            <Eye className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-primary mt-1">
            {stats.totalImpressions.toLocaleString()}
          </p>
          <span className="text-[10px] text-ink-muted">Aggregated counter</span>
        </div>

        <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-ink-muted text-xs">
            <span className="font-mono uppercase text-[11px]">Clicks & CTR</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-700 mt-1">
            {stats.totalClicks.toLocaleString()} <span className="text-xs font-sans text-ink-muted font-normal">({stats.ctr}%)</span>
          </p>
          <span className="text-[10px] text-ink-muted">Non-blocking beacons</span>
        </div>
      </div>

      {/* ======================================================================
          MASTER COMMERCIAL ADS SWITCH BANNER
          ====================================================================== */}
      <div className={`border rounded-sm p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        visibilityConfig.masterEnabled
          ? 'bg-emerald-50/60 border-emerald-200'
          : 'bg-slate-100 border-slate-300'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
            visibilityConfig.masterEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'
          }`}>
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-ink">
                Global Website Commercial Ads Display:
              </h3>
              <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                visibilityConfig.masterEnabled ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-300 text-slate-800'
              }`}>
                {visibilityConfig.masterEnabled ? 'ALL ADS ACTIVE' : 'ALL ADS PAUSED'}
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              {visibilityConfig.masterEnabled
                ? 'Ads are actively showing on Homepage, Article Pages, and Feeds based on per-zone controls below.'
                : 'Master switch is OFF: All commercial ad slots across the entire website are completely hidden from readers.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleMaster}
          className={`px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 ${
            visibilityConfig.masterEnabled
              ? 'bg-slate-800 hover:bg-slate-900 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {visibilityConfig.masterEnabled ? (
            <>
              <EyeOff className="w-4 h-4 text-rose-300" />
              <span>Hide All Ads on Website</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-emerald-200" />
              <span>Enable All Ads on Website</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border-subtle flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('direct')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'direct'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-ink-secondary hover:text-ink hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Direct Campaigns ({directAds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('placement')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'placement'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-ink-secondary hover:text-ink hover:bg-slate-50'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Website Ad Locations Map</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'preview'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-ink-secondary hover:text-ink hover:bg-slate-50'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Slot Preview & Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('adsense')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'adsense'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-ink-secondary hover:text-ink hover:bg-slate-50'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Google AdSense Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'diagnostics'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-ink-secondary hover:text-ink hover:bg-slate-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Compliance & Diagnostics</span>
          {diagnostics && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              diagnostics.score === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {diagnostics.score}%
            </span>
          )}
        </button>
      </div>

      {/* ======================================================================
          TAB 1: First-Party Direct Sponsor Campaigns
          ====================================================================== */}
      {activeTab === 'direct' && (
        <div className="space-y-4">
          <div className="bg-surface-lowest border border-border-subtle rounded-sm p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-ink">
                Direct Media House Sponsor Slots (A1 to A8)
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                First-party advertisements with dedicated creatives, click tracking, and guaranteed zero-layout-shift rendering.
              </p>
            </div>
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-3 py-1.5 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Campaign</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {directAds.map((ad) => {
              const isSlotVisible = visibilityConfig.masterEnabled && (visibilityConfig.zones[ad.zone] !== false) && ad.isActive;
              const locationInfo = ZONE_PLACEMENT_DETAILS[ad.zone];

              return (
                <div
                  key={ad.id || ad.zone}
                  className={`bg-surface-lowest border rounded-sm p-4 shadow-2xs transition-all flex flex-col justify-between ${
                    isSlotVisible ? 'border-border-subtle hover:border-primary/50' : 'border-slate-200 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div>
                    {/* Card Header with Location & Prominent Toggle Button */}
                    <div className="flex items-center justify-between pb-2 border-b border-border-subtle/70 mb-3 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-xs bg-primary text-white text-[10px] font-mono font-bold shrink-0">
                          ZONE {ad.zone}
                        </span>
                        <span className="text-[11px] text-ink-muted truncate" title={locationInfo?.name || ZONE_DESCRIPTIONS[ad.zone]}>
                          {locationInfo?.name || ZONE_DESCRIPTIONS[ad.zone]}
                        </span>
                      </div>

                      {/* Prominent Open / Close Ad Toggle Button */}
                      <button
                        onClick={() => handleToggleOpenClose(ad.zone, ad.id)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 border ${
                          isSlotVisible
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/20'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                        }`}
                        title={isSlotVisible ? 'Click to CLOSE this ad (Hide from live website & database)' : 'Click to OPEN this ad (Show on live website & database)'}
                      >
                        {isSlotVisible ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <Eye className="w-3.5 h-3.5 text-emerald-100" />
                            <span>AD OPEN (ACTIVE)</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                            <span>AD CLOSED (OFF)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Location Pill Bar */}
                    {locationInfo && (
                      <div className="mb-2.5 px-2 py-1 bg-slate-50 border border-slate-200/80 rounded text-[10px] text-slate-600 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{locationInfo.pageLocations.join(' • ')}</span>
                      </div>
                    )}

                    {/* Body Content */}
                    <div className="flex items-start gap-3">
                      {ad.mediaUrl ? (
                        <div className="w-20 h-20 rounded-xs bg-slate-100 border border-border-subtle overflow-hidden shrink-0">
                          <img
                            src={ad.mediaUrl}
                            alt={ad.altText || ad.advertiserName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/logo.png';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xs bg-gradient-to-br from-primary/10 to-secondary-gold/20 border border-border-subtle flex items-center justify-center p-1 shrink-0 text-center">
                          <span className="text-[10px] font-bold text-primary">No Image</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-primary truncate">
                          {ad.advertiserName}
                        </h3>
                        <p className="font-serif text-xs font-semibold text-ink line-clamp-2 mt-1 leading-snug">
                          {ad.creativeText}
                        </p>
                        <div className="mt-2 text-[11px] text-ink-muted flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Eye className="w-2.5 h-2.5" /> {(ad.impressionsCount || 0).toLocaleString()} impr
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <MousePointer className="w-2.5 h-2.5" /> {(ad.clicksCount || 0).toLocaleString()} clicks
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-border-subtle/70 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-ink-muted truncate max-w-[180px]" title={ad.destinationUrl}>
                      Target: <span className="font-mono text-ink">{ad.destinationUrl || 'None'}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleOpenClose(ad.zone, ad.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                          isSlotVisible
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                        title={isSlotVisible ? 'Click to CLOSE this ad' : 'Click to OPEN this ad'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isSlotVisible ? 'Close Ad' : 'Open Ad'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setPreviewZone(ad.zone);
                          setPreviewVariant((locationInfo?.defaultFormat || 'card') as any);
                          setActiveTab('preview');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Preview this exact slot"
                      >
                        <Eye className="w-3 h-3 text-slate-600" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(ad)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
                        title="Edit Campaign"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id, ad.zone)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-editorial-red rounded transition-colors cursor-pointer"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 2: Google AdSense Configuration
          ====================================================================== */}
      {activeTab === 'adsense' && (
        <div className="space-y-6">
          {/* Master AdSense Settings Card */}
          <div className="bg-surface-lowest border border-border-subtle rounded-sm p-5 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h2 className="font-serif text-lg font-bold text-ink">
                  Google AdSense Global Settings
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Configure publisher credentials, inventory routing priority, and test mode flags.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adSenseConfig.enabled}
                    onChange={(e) => setAdSenseConfig({ ...adSenseConfig, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-xs font-bold text-ink">
                  {adSenseConfig.enabled ? 'AdSense Enabled' : 'AdSense Disabled'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-ink mb-1">
                  Publisher Client ID
                </label>
                <input
                  type="text"
                  value={adSenseConfig.clientId}
                  onChange={(e) => setAdSenseConfig({ ...adSenseConfig, clientId: e.target.value.trim() })}
                  placeholder="ca-pub-6758961188222479"
                  className="w-full bg-surface-container border border-border-subtle px-3 py-2 text-xs font-mono rounded-sm focus:outline-hidden focus:border-primary"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">
                  Must match ads.txt entry in public directory.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink mb-1">
                  Ad Serving Priority
                </label>
                <select
                  value={adSenseConfig.priority}
                  onChange={(e) => setAdSenseConfig({ ...adSenseConfig, priority: e.target.value as any })}
                  className="w-full bg-surface-container border border-border-subtle px-3 py-2 text-xs font-bold rounded-sm focus:outline-hidden focus:border-primary"
                >
                  <option value="direct_first">Direct First (AdSense as fallback) [Recommended]</option>
                  <option value="adsense_first">AdSense First (Direct as fallback)</option>
                  <option value="direct_only">Direct Only (Disable AdSense units)</option>
                  <option value="adsense_only">AdSense Only (Disable Direct units)</option>
                </select>
                <span className="text-[10px] text-ink-muted mt-1 block">
                  Determines which creative gets first priority on render.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink mb-1">
                  Development Test Mode
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={adSenseConfig.testMode}
                    onChange={(e) => setAdSenseConfig({ ...adSenseConfig, testMode: e.target.checked })}
                    className="accent-primary"
                  />
                  <span className="font-semibold text-ink">Add data-ad-test=&quot;on&quot;</span>
                </label>
                <span className="text-[10px] text-ink-muted mt-1 block">
                  Protects account against invalid click penalties during local QA.
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveAdSense}
                className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save AdSense Configuration</span>
              </button>
            </div>
          </div>

          {/* Per-Zone AdSense Slot IDs */}
          <div className="bg-surface-lowest border border-border-subtle rounded-sm p-5 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-ink pb-2 border-b border-border-subtle">
              Per-Zone AdSense Ad Unit Slot IDs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-border-subtle text-ink-muted font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Zone</th>
                    <th className="p-2.5">Placement Location</th>
                    <th className="p-2.5">AdSense Unit Slot ID</th>
                    <th className="p-2.5">Responsive Format</th>
                    <th className="p-2.5 text-right">Zone Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {Object.keys(adSenseConfig.zones).map((zoneKey) => {
                    const z = adSenseConfig.zones[zoneKey];
                    return (
                      <tr key={zoneKey} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold font-mono text-primary">
                          {zoneKey}
                        </td>
                        <td className="p-2.5 text-ink-secondary text-xs">
                          {ZONE_DESCRIPTIONS[zoneKey] || 'General Content Slot'}
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={z.slotId}
                            onChange={(e) => {
                              const newZones = {
                                ...adSenseConfig.zones,
                                [zoneKey]: { ...z, slotId: e.target.value.trim() },
                              };
                              setAdSenseConfig({ ...adSenseConfig, zones: newZones });
                            }}
                            className="bg-surface-container border border-border-subtle px-2 py-1 text-xs font-mono rounded-xs w-36"
                          />
                        </td>
                        <td className="p-2.5">
                          <select
                            value={z.format}
                            onChange={(e) => {
                              const newZones = {
                                ...adSenseConfig.zones,
                                [zoneKey]: { ...z, format: e.target.value as any },
                              };
                              setAdSenseConfig({ ...adSenseConfig, zones: newZones });
                            }}
                            className="bg-surface-container border border-border-subtle px-2 py-1 text-xs rounded-xs"
                          >
                            <option value="rectangle">Rectangle (300x250)</option>
                            <option value="horizontal">Horizontal (Leaderboard)</option>
                            <option value="vertical">Vertical (Portrait)</option>
                            <option value="auto">Auto Responsive</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const newZones = {
                                ...adSenseConfig.zones,
                                [zoneKey]: { ...z, enabled: !z.enabled },
                              };
                              setAdSenseConfig({ ...adSenseConfig, zones: newZones });
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                              z.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {z.enabled ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveAdSense}
                className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Slot IDs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 3: Compliance & Automated Diagnostic Test Suite
          ====================================================================== */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-5">
          <div className="bg-surface-lowest border border-border-subtle rounded-sm p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="font-serif text-lg font-bold text-ink">
                  Google AdSense & First-Party Policy Test Suite
                </h2>
              </div>
              <p className="text-xs text-ink-secondary mt-1">
                Automated diagnostics verifying crawlers, Core Web Vitals, Double-Push safeguards, and policy compliance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-mono text-ink-muted uppercase">Health Score</span>
                <p className={`font-serif text-2xl font-black ${
                  diagnostics?.score === 100 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {diagnostics?.score || 0}%
                </p>
              </div>
              <button
                onClick={handleRunDiagnostics}
                disabled={loadingDiagnostics}
                className="px-3.5 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDiagnostics ? 'animate-spin' : ''}`} />
                <span>Re-run Tests</span>
              </button>
            </div>
          </div>

          {/* Test Case Cards */}
          <div className="space-y-3">
            {diagnostics?.items.map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-sm border shadow-2xs flex items-start gap-3 transition-all ${
                  test.status === 'passed'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : test.status === 'warning'
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-red-50/40 border-red-200'
                }`}
              >
                {test.status === 'passed' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {test.status === 'warning' && (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                {test.status === 'failed' && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-xs text-ink uppercase tracking-wider">
                      {test.name}
                    </h4>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                      test.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : test.status === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {test.status}
                    </span>
                  </div>

                  <p className="text-xs text-ink-secondary mt-1 font-medium">
                    {test.message}
                  </p>

                  {test.details && (
                    <p className="text-[11px] font-mono text-ink-muted mt-1 bg-white/70 p-1.5 rounded-xs border border-border-subtle/40">
                      {test.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 2: Website Ad Locations Map & Visual Blueprint
          ====================================================================== */}
      {activeTab === 'placement' && (
        <div className="space-y-6">
          <div className="bg-surface-lowest border border-border-subtle rounded-sm p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-lg font-bold text-ink">
                  Website Commercial Ad Placement Guide & Map
                </h2>
              </div>
              <p className="text-xs text-ink-secondary mt-1">
                Visual map of all 8 ad zones across Homepage, Article Pages, and Feeds. Toggle visibility or preview any slot in place.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200">
                <button
                  onClick={() => setWireframeMode('homepage')}
                  className={`px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
                    wireframeMode === 'homepage' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600 hover:text-ink'
                  }`}
                >
                  Homepage Layout
                </button>
                <button
                  onClick={() => setWireframeMode('article')}
                  className={`px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
                    wireframeMode === 'article' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600 hover:text-ink'
                  }`}
                >
                  Article Page Layout
                </button>
              </div>
            </div>
          </div>

          {/* Wireframe Diagram */}
          {wireframeMode === 'homepage' ? (
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                  <h3 className="font-serif font-bold text-sm text-ink uppercase tracking-wider">
                    Homepage Commercial Architecture
                  </h3>
                </div>
                <span className="text-xs text-slate-500">2 Dedicated 4-Ad Grid Strips • 8 Total Zones</span>
              </div>

              {/* Wireframe Blocks */}
              <div className="space-y-3 font-sans text-xs">
                {/* 1. Header & Lead */}
                <div className="p-3 bg-white border border-slate-200 rounded text-center text-slate-500 font-semibold">
                  1. Top Navigation, Breaking News Ticker & Market Pulse
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-8 p-4 bg-white border border-slate-200 rounded text-center text-slate-600 font-bold">
                    Feature Section: Hero Story Lead Slider
                  </div>
                  <div className="md:col-span-4 p-4 bg-white border border-slate-200 rounded text-center text-slate-600 font-bold">
                    Editor’s Picks
                  </div>
                </div>

                {/* ⭐ STRIP 1: A1, A2, A3, A4 */}
                <div className="p-4 bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Commercial Strip 1: 4-Ad Grid Row (Below Feature Section & Editor’s Picks)</span>
                    </span>
                    <span className="text-amber-700 font-normal">Desktop: 4 Columns | Mobile: 2x2 Grid</span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {['A1', 'A2', 'A3', 'A4'].map((z) => {
                      const ad = directAds.find(a => a.zone === z);
                      const isVisible = visibilityConfig.masterEnabled && (visibilityConfig.zones[z] !== false) && (ad?.isActive ?? true);
                      return (
                        <div
                          key={z}
                          className={`p-3 rounded-md border shadow-2xs transition-all flex flex-col justify-between ${
                            isVisible ? 'bg-white border-amber-300' : 'bg-slate-100 border-slate-300 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary text-white">
                                {z}
                              </span>
                              <button
                                onClick={() => handleToggleZoneVisibility(z)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                                  isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isVisible ? 'SHOWING' : 'HIDDEN'}
                              </button>
                            </div>
                            <p className="font-bold text-xs text-ink truncate">
                              {ad?.advertiserName || `Sponsor ${z}`}
                            </p>
                            <p className="text-[11px] text-ink-muted line-clamp-1 mt-0.5">
                              {ZONE_PLACEMENT_DETAILS[z]?.name}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Slot {z.replace('A', '')} of 4</span>
                            <button
                              onClick={() => {
                                setPreviewZone(z);
                                setPreviewVariant('card');
                                setActiveTab('preview');
                              }}
                              className="text-[11px] text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Preview</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* News Sections */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-7 p-3 bg-white border border-slate-200 rounded text-center text-slate-500">
                    Latest News Chronological Wire
                  </div>
                  <div className="md:col-span-5 p-3 bg-white border border-slate-200 rounded text-center text-slate-500">
                    Most Read Across India
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded text-center text-slate-500">
                  National Politics • Business & Markets • Video Explainer Theater
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded text-center text-slate-500">
                  Technology & Deep Tech • World & Diplomacy
                </div>

                {/* ⭐ STRIP 2: A5, A6, A7, A8 */}
                <div className="p-4 bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Commercial Strip 2: 4-Ad Grid Row (Below Tech & World Affairs)</span>
                    </span>
                    <span className="text-amber-700 font-normal">Desktop: 4 Columns | Mobile: 2x2 Grid</span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {['A5', 'A6', 'A7', 'A8'].map((z) => {
                      const ad = directAds.find(a => a.zone === z);
                      const isVisible = visibilityConfig.masterEnabled && (visibilityConfig.zones[z] !== false) && (ad?.isActive ?? true);
                      return (
                        <div
                          key={z}
                          className={`p-3 rounded-md border shadow-2xs transition-all flex flex-col justify-between ${
                            isVisible ? 'bg-white border-amber-300' : 'bg-slate-100 border-slate-300 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary text-white">
                                {z}
                              </span>
                              <button
                                onClick={() => handleToggleZoneVisibility(z)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                                  isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isVisible ? 'SHOWING' : 'HIDDEN'}
                              </button>
                            </div>
                            <p className="font-bold text-xs text-ink truncate">
                              {ad?.advertiserName || `Sponsor ${z}`}
                            </p>
                            <p className="text-[11px] text-ink-muted line-clamp-1 mt-0.5">
                              {ZONE_PLACEMENT_DETAILS[z]?.name}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Slot {Number(z.replace('A', '')) - 4} of 4</span>
                            <button
                              onClick={() => {
                                setPreviewZone(z);
                                setPreviewVariant('card');
                                setActiveTab('preview');
                              }}
                              className="text-[11px] text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Preview</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded text-center text-slate-500">
                  Metromat Editorial Opinion & Public Pulse • Morning Intelligence Dispatch
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                  <h3 className="font-serif font-bold text-sm text-ink uppercase tracking-wider">
                    Article Page Commercial Architecture
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Right Rail Sidebar (3 Ads) + Bottom 4-Ad Grid Strip</span>
              </div>

              {/* Article Page Blueprint */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                {/* Main Article (8 cols) */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="p-4 bg-white border border-slate-200 rounded text-slate-600 font-semibold">
                    Article Header: Category, Headline, Dek, Author Byline & Social Share Bar
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded text-slate-600 font-semibold">
                    Featured Hero Image (16:9 / 16:10) with Photo Credit & Caption
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded text-slate-600 font-semibold">
                    Gutenberg Block-Driven Story Body (Paragraphs, Quotes, Key Points)
                  </div>

                  {/* Mobile note for A3 */}
                  <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded text-[11px] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>📱 <strong>Mobile Note:</strong> Ad A3 moves down directly below the article reading body on mobile phones.</span>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded text-slate-600 font-semibold">
                    Author Biography Card & Reader Perspectives / Discussion
                  </div>

                  {/* Mobile note for A7 */}
                  <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded text-[11px] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>📱 <strong>Mobile Note:</strong> Ad A7 moves down directly below Reader Perspectives on mobile phones.</span>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded text-slate-600 font-semibold">
                    Related Coverage & Analysis Stories Grid
                  </div>
                </div>

                {/* Right Rail Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-3">
                  {/* ⭐ A3: Top Sidebar Ad */}
                  {(() => {
                    const ad = directAds.find(a => a.zone === 'A3');
                    const isVisible = visibilityConfig.masterEnabled && (visibilityConfig.zones['A3'] !== false) && (ad?.isActive ?? true);
                    return (
                      <div className={`p-3 rounded border shadow-2xs space-y-2 ${
                        isVisible ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-100 border-slate-300 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary text-white">
                            AD A3
                          </span>
                          <button
                            onClick={() => handleToggleZoneVisibility('A3')}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                              isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isVisible ? 'SHOWING' : 'HIDDEN'}
                          </button>
                        </div>
                        <p className="font-bold text-xs text-ink">Right Rail Top Ad (Next to Title & Intro)</p>
                        <p className="text-[11px] text-slate-600 truncate">{ad?.advertiserName || 'Suresh Chand Agarwal Memorial'}</p>
                        <button
                          onClick={() => {
                            setPreviewZone('A3');
                            setPreviewVariant('sidebar');
                            setActiveTab('preview');
                          }}
                          className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                        >
                          <span>Preview A3 Poster</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })()}

                  <div className="p-3 bg-white border border-slate-200 rounded text-center text-slate-600 font-semibold">
                    Most Read Across Desks & Morning Briefing
                  </div>

                  {/* ⭐ A4: Middle Sidebar Ad */}
                  {(() => {
                    const ad = directAds.find(a => a.zone === 'A4');
                    const isVisible = visibilityConfig.masterEnabled && (visibilityConfig.zones['A4'] !== false) && (ad?.isActive ?? true);
                    return (
                      <div className={`p-3 rounded border shadow-2xs space-y-2 ${
                        isVisible ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-100 border-slate-300 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary text-white">
                            AD A4
                          </span>
                          <button
                            onClick={() => handleToggleZoneVisibility('A4')}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                              isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isVisible ? 'SHOWING' : 'HIDDEN'}
                          </button>
                        </div>
                        <p className="font-bold text-xs text-ink">Sidebar Middle Ad (Below Most Read)</p>
                        <p className="text-[11px] text-slate-600 truncate">{ad?.advertiserName || 'Shastri Patanjali'}</p>
                        <button
                          onClick={() => {
                            setPreviewZone('A4');
                            setPreviewVariant('card');
                            setActiveTab('preview');
                          }}
                          className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                        >
                          <span>Preview A4 Card</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })()}

                  {/* ⭐ A7: Lower Sidebar Ad */}
                  {(() => {
                    const ad = directAds.find(a => a.zone === 'A7');
                    const isVisible = visibilityConfig.masterEnabled && (visibilityConfig.zones['A7'] !== false) && (ad?.isActive ?? true);
                    return (
                      <div className={`p-3 rounded border shadow-2xs space-y-2 ${
                        isVisible ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-100 border-slate-300 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary text-white">
                            AD A7
                          </span>
                          <button
                            onClick={() => handleToggleZoneVisibility('A7')}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                              isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isVisible ? 'SHOWING' : 'HIDDEN'}
                          </button>
                        </div>
                        <p className="font-bold text-xs text-ink">Sidebar Lower Ad (Opposite Comments)</p>
                        <p className="text-[11px] text-slate-600 truncate">{ad?.advertiserName || 'Invest India'}</p>
                        <button
                          onClick={() => {
                            setPreviewZone('A7');
                            setPreviewVariant('card');
                            setActiveTab('preview');
                          }}
                          className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                        >
                          <span>Preview A7 Card</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ⭐ Full-Width Bottom Strip (A1, A2, A5, A6) */}
              <div className="mt-4 p-4 bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Article Bottom 4-Ad Strip (Placed below Related Coverage & Analysis)</span>
                  </span>
                  <span className="text-amber-700 font-normal">Zones: A1, A2, A5, A6</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['A1', 'A2', 'A5', 'A6'].map((z) => {
                    const ad = directAds.find(a => a.zone === z);
                    const isVisible = visibilityConfig.masterEnabled && (visibilityConfig.zones[z] !== false) && (ad?.isActive ?? true);
                    return (
                      <div
                        key={z}
                        className={`p-3 rounded-md border shadow-2xs transition-all flex flex-col justify-between ${
                          isVisible ? 'bg-white border-amber-300' : 'bg-slate-100 border-slate-300 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary text-white">
                            {z}
                          </span>
                          <button
                            onClick={() => handleToggleZoneVisibility(z)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                              isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isVisible ? 'SHOWING' : 'HIDDEN'}
                          </button>
                        </div>
                        <p className="font-bold text-xs text-ink truncate">
                          {ad?.advertiserName || `Sponsor ${z}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Detailed All-Zone Locations Table */}
          <div className="bg-surface-lowest border border-border-subtle rounded-sm p-4 sm:p-5 shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-base text-ink">
              Comprehensive Zone Mapping & Visibility Directory
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border-subtle text-[11px] font-mono font-bold text-ink-muted uppercase">
                    <th className="p-3">Zone</th>
                    <th className="p-3">Description & Locations</th>
                    <th className="p-3">Desktop Alignment</th>
                    <th className="p-3">Mobile Adaptive Behavior</th>
                    <th className="p-3">Live Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'].map((zoneKey) => {
                    const info = ZONE_PLACEMENT_DETAILS[zoneKey];
                    const ad = directAds.find(a => a.zone === zoneKey);
                    const isVisible = visibilityConfig.masterEnabled && (visibilityConfig.zones[zoneKey] !== false) && (ad?.isActive ?? true);

                    return (
                      <tr key={zoneKey} className={`transition-colors ${isVisible ? 'hover:bg-slate-50/60' : 'bg-slate-50/40 opacity-70'}`}>
                        <td className="p-3 font-mono font-bold text-primary">
                          <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                            {zoneKey}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-ink">{info?.name || zoneKey}</p>
                          <p className="text-[11px] text-ink-muted mt-0.5">{info?.pageLocations.join(' • ')}</p>
                        </td>
                        <td className="p-3 text-ink-secondary">
                          {info?.desktopPosition}
                        </td>
                        <td className="p-3 text-ink-secondary font-medium">
                          {info?.mobilePosition}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleOpenClose(zoneKey)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs transition-all border ${
                              isVisible
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                            }`}
                            title={isVisible ? 'Click to CLOSE this ad' : 'Click to OPEN this ad'}
                          >
                            {isVisible ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                <Eye className="w-3.5 h-3.5 text-emerald-100" />
                                <span>AD OPEN (ACTIVE)</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                                <span>AD CLOSED (OFF)</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setPreviewZone(zoneKey);
                              setPreviewVariant((info?.defaultFormat || 'card') as any);
                              setActiveTab('preview');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Preview
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 3: Live Slot Preview & Device Simulator
          ====================================================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="bg-surface-lowest border border-border-subtle rounded-sm p-4 sm:p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <span>Interactive Live Slot Simulator</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Real-time Render
                </span>
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Simulate exact reader-facing ad appearance on Desktop, Tablet, and Mobile smartphones with responsive image sizing.
              </p>
            </div>

            {/* Selectors and Device Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Device Frame Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'desktop' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-ink'
                  }`}
                  title="Desktop (Full)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'tablet' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-ink'
                  }`}
                  title="Tablet (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'mobile' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-ink'
                  }`}
                  title="Mobile Phone (390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>

              {/* Zone Selector */}
              <select
                value={previewZone}
                onChange={(e) => setPreviewZone(e.target.value)}
                className="bg-surface-container border border-border-subtle px-3 py-1.5 text-xs font-bold rounded-sm cursor-pointer"
              >
                {['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'].map((z) => (
                  <option key={z} value={z}>Zone {z} ({ZONE_PLACEMENT_DETAILS[z]?.name || z})</option>
                ))}
              </select>

              {/* Format Selector */}
              <select
                value={previewVariant}
                onChange={(e) => setPreviewVariant(e.target.value as any)}
                className="bg-surface-container border border-border-subtle px-3 py-1.5 text-xs font-bold rounded-sm cursor-pointer"
              >
                <option value="card">Card (4-Ad Grid Row / Sidebar)</option>
                <option value="sidebar">Sidebar (Vertical Tall Poster)</option>
                <option value="banner">Banner (Horizontal Bar)</option>
              </select>
            </div>
          </div>

          {/* Live Visibility Status Strip for Previewed Slot */}
          {(() => {
            const isVisible = visibilityConfig.masterEnabled && (visibilityConfig.zones[previewZone] !== false);
            return (
              <div className={`p-3.5 rounded border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                isVisible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isVisible ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>
                    <strong>Slot {previewZone} Status:</strong> Currently{' '}
                    <strong className={isVisible ? 'text-emerald-700' : 'text-slate-600'}>
                      {isVisible ? 'SHOWING ON LIVE WEBSITE' : 'HIDDEN FROM LIVE WEBSITE'}
                    </strong>
                    {!visibilityConfig.masterEnabled && ' (Disabled by Master Switch)'}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleOpenClose(previewZone)}
                  className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto shadow-xs border ${
                    isVisible
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                  }`}
                  title={isVisible ? 'Click to CLOSE this ad' : 'Click to OPEN this ad'}
                >
                  {isVisible ? (
                    <>
                      <Power className="w-3.5 h-3.5 text-rose-600" />
                      <span>Close Ad (Hide from Website)</span>
                    </>
                  ) : (
                    <>
                      <Power className="w-3.5 h-3.5 text-white" />
                      <span>Open Ad (Show on Website)</span>
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Live Canvas / Simulator Frame */}
          <div className="p-4 sm:p-8 bg-slate-200/70 border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center min-h-[480px]">
            <div
              className={`transition-all duration-300 bg-white shadow-xl relative ${
                previewDevice === 'mobile'
                  ? 'w-[390px] min-h-[640px] rounded-3xl border-8 border-slate-900 p-4 shadow-2xl ring-1 ring-black/20 my-4'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] min-h-[680px] rounded-2xl border-8 border-slate-800 p-6 shadow-2xl ring-1 ring-black/20 my-4'
                  : 'w-full max-w-4xl p-6 rounded-lg'
              }`}
            >
              {/* Phone Status Bar Mock */}
              {previewDevice !== 'desktop' && (
                <div className="bg-slate-900 text-white text-[11px] px-4 py-1 flex items-center justify-between font-mono -mx-4 -mt-4 mb-4 select-none rounded-t-xl">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">5G</span>
                    <div className="w-4 h-2 border border-white rounded-xs p-0.5">
                      <div className="w-full h-full bg-white rounded-2xs"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Render AdSlot */}
              <div className={previewVariant === 'card' ? 'w-full max-w-sm mx-auto' : 'w-full'}>
                <AdSlot zone={previewZone as any} variant={previewVariant} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          CREATE / EDIT DIRECT AD MODAL
          ====================================================================== */}
      {isModalOpen && editingAd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-lowest border border-border-subtle rounded-sm shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-serif text-lg font-bold text-ink">
                {editingAd.id ? `Edit Ad for Zone ${editingAd.zone}` : 'Create New Direct Ad'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-ink-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                  Target Zone
                </label>
                <select
                  value={editingAd.zone}
                  onChange={(e) => setEditingAd({ ...editingAd, zone: e.target.value })}
                  className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded-sm font-bold text-ink"
                >
                  {['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'].map((z) => (
                    <option key={z} value={z}>Zone {z} — {ZONE_DESCRIPTIONS[z]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                  Advertiser / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingAd.advertiserName}
                  onChange={(e) => setEditingAd({ ...editingAd, advertiserName: e.target.value })}
                  placeholder="e.g. Reserve Bank of India / Patanjali Chikitsalaya"
                  className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded-sm text-ink"
                />
              </div>

              <div>
                <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                  Creative Headline / Copy *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingAd.creativeText}
                  onChange={(e) => setEditingAd({ ...editingAd, creativeText: e.target.value })}
                  placeholder="Compelling headline or sponsor announcement text..."
                  className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded-sm text-ink"
                />
              </div>

              <div>
                <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                  Creative Media Image URL
                </label>
                <input
                  type="text"
                  value={editingAd.mediaUrl || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, mediaUrl: e.target.value })}
                  placeholder="/uploads/ads/suresh-chand-agarwal-memorial.png"
                  className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded-sm text-ink font-mono"
                />

                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-ink-muted">Quick Presets:</span>
                  {SAMPLE_IMAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditingAd({ ...editingAd, mediaUrl: opt.value })}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer text-slate-700"
                    >
                      {opt.label.slice(0, 15)}...
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                    Destination URL or Phone
                  </label>
                  <input
                    type="text"
                    value={editingAd.destinationUrl}
                    onChange={(e) => setEditingAd({ ...editingAd, destinationUrl: e.target.value })}
                    placeholder="https://... or tel:9871937299"
                    className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded-sm text-ink font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink uppercase text-[11px] mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={editingAd.ctaText || 'Learn More'}
                    onChange={(e) => setEditingAd({ ...editingAd, ctaText: e.target.value })}
                    placeholder="Learn More / Call Now"
                    className="w-full bg-surface-container border border-border-subtle px-3 py-2 rounded-sm text-ink text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink uppercase text-[11px]">Ad Status:</span>
                  <button
                    type="button"
                    onClick={() => setEditingAd({ ...editingAd, isActive: !editingAd.isActive })}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                      editingAd.isActive
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{editingAd.isActive ? 'OPEN (LIVE ON WEBSITE)' : 'CLOSED (HIDDEN)'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-sm transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Ad</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
