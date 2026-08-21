import React, { useState } from 'react';
import { 
  Sliders, Monitor, Tablet, Smartphone, Eye, LayoutGrid, 
  Layers, Megaphone, DollarSign, AlertTriangle, ChevronUp, ChevronDown, Check
} from 'lucide-react';

export type DeviceViewport = 'desktop' | 'tablet' | 'mobile-390' | 'mobile-360';

interface EditorialToolbarProps {
  currentTemplate: string;
  onSelectTemplate: (templateId: string, params?: any) => void;
  viewport: DeviceViewport;
  onSetViewport: (viewport: DeviceViewport) => void;
  isEmergencyBreaking: boolean;
  onToggleEmergencyBreaking: () => void;
  showAds: boolean;
  onToggleAds: () => void;
  showCorrections: boolean;
  onToggleCorrections: () => void;
  isLoadingSkeleton: boolean;
  onToggleSkeleton: () => void;
}

export const EditorialToolbar: React.FC<EditorialToolbarProps> = ({
  currentTemplate,
  onSelectTemplate,
  viewport,
  onSetViewport,
  isEmergencyBreaking,
  onToggleEmergencyBreaking,
  showAds,
  onToggleAds,
  showCorrections,
  onToggleCorrections,
  isLoadingSkeleton,
  onToggleSkeleton,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const templateList = [
    { id: 'homepage', num: '01', name: 'Homepage (Master Frontpage)' },
    { id: 'latest', num: '02', name: 'Latest News (Chronological)' },
    { id: 'category', num: '03', name: 'Category / Section' },
    { id: 'article-standard', num: '04', name: 'Standard News Article' },
    { id: 'article-breaking', num: '05', name: 'Breaking News Article' },
    { id: 'article-opinion', num: '06', name: 'Opinion / Editorial Article' },
    { id: 'video-hub', num: '07', name: 'Video Hub' },
    { id: 'video-detail', num: '08', name: 'Video Detail & Transcript' },
    { id: 'gallery', num: '09', name: 'Photo / Gallery Essay' },
    { id: 'search', num: '10', name: 'Search Results' },
    { id: 'author', num: '11', name: 'Author Profile (Journalist)' },
    { id: 'trending', num: '12', name: 'Trending / Most Read (Top 10)' },
    { id: 'static', num: '13', name: 'Static Information (About/Policies)' },
    { id: 'not-found', num: '14', name: '404 / Error Page' },
  ];

  if (isMinimized) {
    return (
      <aside aria-label="Editorial Sandbox Toolbar" className="fixed bottom-3 right-3 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-primary text-white border-2 border-secondary px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-secondary-gold" />
          <span>Editorial Tools ({currentTemplate})</span>
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Editorial Sandbox Toolbar" className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="bg-primary text-white border-2 border-secondary shadow-2xl rounded-md overflow-hidden text-xs">
        {/* Main Toolbar Strip */}
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-3 flex-wrap bg-primary-dark">
          {/* Left: Brand / CMS Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-serif font-bold text-xs sm:text-sm tracking-wide text-white">
              NP NEWS METRO
            </span>
            <span className="hidden sm:inline-block bg-secondary-gold/20 text-secondary-gold px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
              WP Editorial Suite
            </span>
          </div>

          {/* Center: Template Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-[11px] font-semibold uppercase">Template:</span>
            <select
              aria-label="Select Editorial Template"
              value={currentTemplate}
              onChange={(e) => onSelectTemplate(e.target.value)}
              className="bg-primary-container border border-slate-600 text-white text-xs font-medium rounded px-2.5 py-1 focus:outline-hidden focus:border-secondary-gold cursor-pointer"
            >
              {templateList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.num} — {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Center-Right: Viewport Switcher */}
          <div className="flex items-center bg-primary-container p-0.5 rounded border border-slate-700">
            <button
              onClick={() => onSetViewport('desktop')}
              className={`p-1.5 rounded transition-colors ${
                viewport === 'desktop' ? 'bg-secondary-gold text-primary font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
              title="Desktop 1440px (100% Fluid)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSetViewport('tablet')}
              className={`p-1.5 rounded transition-colors ${
                viewport === 'tablet' ? 'bg-secondary-gold text-primary font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
              title="Tablet 768px"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSetViewport('mobile-390')}
              className={`p-1.5 rounded transition-colors ${
                viewport === 'mobile-390' ? 'bg-secondary-gold text-primary font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
              title="Mobile Standard 390px"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSetViewport('mobile-360')}
              className={`p-1 text-[10px] font-bold rounded transition-colors ${
                viewport === 'mobile-360' ? 'bg-secondary-gold text-primary shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Compact 360px"
            >
              360px
            </button>
          </div>

          {/* Right: Expand Details & Minimize */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-primary-container px-2 py-1 rounded border border-slate-700"
            >
              <Sliders className="w-3 h-3 text-secondary-gold" />
              <span className="hidden sm:inline">CMS Controls</span>
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-white bg-primary-container rounded border border-slate-700"
              title="Minimize Toolbar (Unobstructed View)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Expanded CMS Controls Drawer */}
        {isExpanded && (
          <div className="p-4 bg-primary border-t border-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            {/* Control 1: Emergency Breaking Mode */}
            <div className="bg-primary-container p-3 rounded border border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs block text-white">Emergency Breaking</span>
                <span className="text-[10px] text-slate-400">High urgency red banner</span>
              </div>
              <button
                onClick={onToggleEmergencyBreaking}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  isEmergencyBreaking ? 'bg-editorial-red' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    isEmergencyBreaking ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Control 2: Ad Slots Toggle */}
            <div className="bg-primary-container p-3 rounded border border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs block text-white">Ad Slots (A1–A7)</span>
                <span className="text-[10px] text-slate-400">Inspect reserved slots</span>
              </div>
              <button
                onClick={onToggleAds}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  showAds ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    showAds ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Control 3: Story Correction Notice */}
            <div className="bg-primary-container p-3 rounded border border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs block text-white">Correction Notice</span>
                <span className="text-[10px] text-slate-400">Editorial transparency note</span>
              </div>
              <button
                onClick={onToggleCorrections}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  showCorrections ? 'bg-secondary-gold' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    showCorrections ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Control 4: Loading Skeletons */}
            <div className="bg-primary-container p-3 rounded border border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs block text-white">Loading Skeleton</span>
                <span className="text-[10px] text-slate-400">Verify skeleton placeholders</span>
              </div>
              <button
                onClick={onToggleSkeleton}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  isLoadingSkeleton ? 'bg-secondary-gold' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    isLoadingSkeleton ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
