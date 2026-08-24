import React, { useState } from 'react';
import { 
  Radio, Pin, Plus, RefreshCw, History, Check, Settings, 
  Layers, Flame, CheckCircle2, ChevronRight, Eye, GripVertical
} from 'lucide-react';
import { initialHeroSlots, initialSectionModules } from '../../data/mockAdminData';
import { HomepageSlotConfig, SectionModuleConfig } from '../../types/admin';

interface HomepageLayoutManagerProps {
  onPublishHomepageChanges: () => void;
  isBreakingNewsActive: boolean;
  onToggleBreakingNews: () => void;
}

export const HomepageLayoutManager: React.FC<HomepageLayoutManagerProps> = ({
  onPublishHomepageChanges,
  isBreakingNewsActive,
  onToggleBreakingNews,
}) => {
  const [heroSlots, setHeroSlots] = useState<HomepageSlotConfig[]>(initialHeroSlots);
  const [sectionModules, setSectionModules] = useState<SectionModuleConfig[]>(initialSectionModules);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedToast, setPublishedToast] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  const handleSelectStoryForSlot = (moduleId: string, slotNumber: number) => {
    setSectionModules(sectionModules.map(mod => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        slots: mod.slots.map(s => {
          if (s.slotNumber !== slotNumber) return s;
          return {
            ...s,
            type: 'pinned',
            articleId: 'post-new-curated',
            label: `Slot ${slotNumber} • Pinned`,
            customHeadline: 'Supreme Court Issues Landmark Verdict on Urban Environmental Zoning',
          };
        }),
      };
    }));
    setHasChanges(true);
  };

  const handleSaveHomepage = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setHasChanges(false);
      setPublishedToast(true);
      onPublishHomepageChanges();
      setTimeout(() => setPublishedToast(false), 3000);
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner: Breaking News Strip Toggle (Matching Screenshot 3) */}
      <div className="bg-surface-lowest border border-border-subtle rounded-xs p-4 sm:p-5 shadow-subtle flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-red-50 text-editorial-red">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-sm text-ink">
              Breaking News Strip
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Toggle breaking news alert banner at the top of the homepage and across the website.
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={onToggleBreakingNews}
          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
            isBreakingNewsActive ? 'bg-editorial-red' : 'bg-slate-300'
          }`}
          title="Toggle Breaking News Strip"
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white transition-transform ${
              isBreakingNewsActive ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Main Title & Action Row (Matching Screenshot 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-ink tracking-tight">
            Homepage Layout
          </h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            Manage editorial curation, slot priorities, and pin lead stories to fixed slots.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
          <button
            onClick={() => setVersionModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-border-subtle rounded-xs text-xs font-bold text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Version History</span>
          </button>

          <button
            onClick={handleSaveHomepage}
            disabled={isPublishing}
            className="px-4 py-2 bg-editorial-red hover:bg-red-800 text-white rounded-xs text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            {isPublishing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{isPublishing ? 'Publishing...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>

      {publishedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Homepage slot arrangement published live to Edge CDN.</span>
        </div>
      )}

      {/* ======================================================================
          HERO PACKAGE (Slot 1-3) & LATEST/TRENDING AUTO-FEED (Screenshot 3)
          ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Hero Package (8 cols) */}
        <div className="lg:col-span-8 bg-surface-lowest border border-border-subtle rounded-xs shadow-subtle p-3.5 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-slate-400" />
              <h3 className="font-serif font-bold text-sm text-ink">
                Hero Package
              </h3>
              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-2xs">
                Slot 1-3
              </span>
            </div>

            <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-ink cursor-pointer">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Slot 1: Primary Pinned Lead */}
            <div className="md:col-span-7 bg-white border border-border-subtle rounded-2xs p-4 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-red-100 text-editorial-red font-mono text-[10px] font-bold px-2 py-0.5 rounded-2xs">
                    PINNED: LEAD
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted">
                    ID: 89421
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-ink leading-snug">
                  Global Markets Rally as Tech Sector Rebounds Strongly
                </h4>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-ink-muted font-mono">
                <span className="w-3 h-3 bg-slate-200 inline-block"></span>
                <span>Last edited: 10m ago</span>
              </div>
            </div>

            {/* Slots 2 & 3 */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white border border-border-subtle rounded-2xs p-3.5 space-y-1">
                <span className="font-mono text-[10px] text-ink-muted block uppercase font-bold">
                  Slot 2
                </span>
                <p className="font-serif font-bold text-xs text-ink leading-snug">
                  New Policy Shifts in Urban Development
                </p>
              </div>

              <div className="bg-white border border-border-subtle rounded-2xs p-3.5 space-y-1">
                <span className="font-mono text-[10px] text-ink-muted block uppercase font-bold">
                  Slot 3
                </span>
                <p className="font-serif font-bold text-xs text-ink leading-snug">
                  Healthcare Reforms: What Citizens Need to Know
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Latest / Trending Auto-Feed (4 cols) */}
        <div className="lg:col-span-4 bg-surface-lowest border border-border-subtle rounded-xs shadow-subtle p-3.5 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-slate-400" />
              <h3 className="font-serif font-bold text-sm text-ink">
                Latest / Trending
              </h3>
            </div>
            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-2xs">
              Auto-feed
            </span>
          </div>

          <div className="space-y-3 font-sans text-xs divide-y divide-slate-100">
            <div className="pt-2 flex items-start gap-2.5">
              <span className="font-serif font-bold text-sm text-ink">1</span>
              <div>
                <p className="font-semibold text-ink leading-snug">
                  Election Commission Announces...
                </p>
                <span className="text-[10px] font-mono text-ink-muted mt-0.5 block">
                  Politics • 2m ago
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-start gap-2.5">
              <span className="font-serif font-bold text-sm text-ink">2</span>
              <div>
                <p className="font-semibold text-ink leading-snug">
                  Central Bank Holds Interest Rates...
                </p>
                <span className="text-[10px] font-mono text-ink-muted mt-0.5 block">
                  Business • 15m ago
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-start gap-2.5">
              <span className="font-serif font-bold text-sm text-ink">3</span>
              <div>
                <p className="font-semibold text-ink leading-snug">
                  Tech Giant Unveils New AI Framework
                </p>
                <span className="text-[10px] font-mono text-ink-muted mt-0.5 block">
                  Tech • 45m ago
                </span>
              </div>
            </div>
          </div>

          <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-border-subtle rounded-2xs text-xs font-bold text-ink transition-colors cursor-pointer text-center">
            Configure Feed Rules
          </button>
        </div>
      </div>

      {/* ======================================================================
          SECTION MODULES (India, Business, etc. matching Screenshot 3)
          ====================================================================== */}
      {sectionModules.map((module) => (
        <div key={module.id} className="bg-surface-lowest border border-border-subtle rounded-xs shadow-subtle p-3.5 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-slate-400" />
              <h3 className="font-serif font-bold text-base text-ink">
                {module.title}
              </h3>
              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-2xs">
                4 Stories
              </span>
            </div>

            <button 
              onClick={() => handleSelectStoryForSlot(module.id, 3)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-border-subtle rounded-2xs text-xs font-bold text-ink flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slot</span>
            </button>
          </div>

          {/* 4 Story Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {module.slots.map((slot) => {
              const hasArticle = !!slot.customHeadline;

              return (
                <div
                  key={slot.slotNumber}
                  className={`rounded-2xs p-3.5 flex flex-col justify-between min-h-[170px] transition-all ${
                    hasArticle
                      ? 'bg-white border border-border-subtle shadow-2xs'
                      : 'border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 items-center justify-center text-center cursor-pointer'
                  }`}
                  onClick={() => !hasArticle && handleSelectStoryForSlot(module.id, slot.slotNumber)}
                >
                  {hasArticle ? (
                    <>
                      <div className="aspect-[16/9] w-full rounded-2xs overflow-hidden bg-slate-900 mb-2.5">
                        <img
                          src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400"
                          alt="Story thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-serif font-bold text-xs text-ink leading-snug line-clamp-2">
                          {slot.customHeadline}
                        </p>
                        <span className="font-mono text-[10px] text-ink-muted mt-1 block">
                          {slot.label || `Slot ${slot.slotNumber}`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center mx-auto text-slate-400">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-mono text-xs font-bold text-slate-600">
                        Empty Slot
                      </p>
                      <p className="text-[10px] text-editorial-red font-bold hover:underline">
                        Select Story
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add New Module Button (Screenshot 3) */}
      <button 
        onClick={() => {
          setSectionModules([
            ...sectionModules,
            {
              id: `mod-${Date.now()}`,
              sectionSlug: 'technology',
              title: 'Technology & Geopolitics',
              slots: [
                { slotNumber: 1, type: 'auto', label: 'Empty Slot' },
                { slotNumber: 2, type: 'auto', label: 'Empty Slot' },
                { slotNumber: 3, type: 'auto', label: 'Empty Slot' },
                { slotNumber: 4, type: 'auto', label: 'Empty Slot' },
              ],
            },
          ]);
        }}
        className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xs bg-surface-lowest flex items-center justify-center gap-2 text-xs font-bold text-ink hover:text-editorial-red transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add New Module</span>
      </button>

      {/* Version History Modal */}
      {versionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-lowest border border-border-subtle rounded-md shadow-2xl max-w-lg w-full p-6 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-serif font-bold text-base text-ink">
                Homepage Layout Version History
              </h3>
              <button 
                onClick={() => setVersionModalOpen(false)}
                className="text-slate-400 hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-editorial-red">v14.2 (Live Production)</span>
                  <p className="text-[11px] text-ink-muted mt-0.5">Published today by Siddharth Varma (19:15 IST)</p>
                </div>
                <span className="text-[10px] bg-editorial-red text-white font-bold px-2 py-0.5 rounded">Current</span>
              </div>

              <div className="p-3 bg-slate-50 border border-border-subtle rounded-2xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink">v14.1 (Morning Edition)</span>
                  <p className="text-[11px] text-ink-muted mt-0.5">Published today by Priya Sharma (07:30 IST)</p>
                </div>
                <button className="text-[11px] text-primary font-bold hover:underline cursor-pointer">Restore</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
