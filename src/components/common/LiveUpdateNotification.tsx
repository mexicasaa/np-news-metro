import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X, RefreshCw } from 'lucide-react';
import { liveUpdateService, VersionManifest } from '../../services/liveUpdateService';
import { useLanguage } from '../../context/LanguageContext';

export const LiveUpdateNotification: React.FC = () => {
  const [updateManifest, setUpdateManifest] = useState<VersionManifest | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { isHindi } = useLanguage();

  useEffect(() => {
    // Start background version monitoring on mount
    liveUpdateService.startBackgroundMonitoring(60000);

    const unsubscribe = liveUpdateService.subscribe((manifest) => {
      if (!liveUpdateService.isDismissed(manifest.buildHash)) {
        setUpdateManifest(manifest);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!updateManifest || isDismissed) {
    return null;
  }

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    liveUpdateService.performSmoothTransition();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    liveUpdateService.dismissUpdate(updateManifest.buildHash);
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="New website edition available"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className="bg-slate-950/95 backdrop-blur-md text-white border border-secondary-gold/50 shadow-2xl rounded-full sm:rounded-lg p-2 sm:p-3 flex items-center justify-between gap-3 sm:gap-4 ring-1 ring-white/10">
        
        {/* Pulsing Live Edition Indicator */}
        <div className="flex items-center gap-2.5 min-w-0 pl-1.5 sm:pl-1">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>

          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-secondary-gold flex-shrink-0 hidden sm:inline-block" />
            <div className="text-xs sm:text-sm font-sans font-medium text-slate-100 truncate">
              {isHindi ? (
                <>
                  <span className="font-bold text-secondary-gold">ताजा संस्करण</span> उपलब्ध
                </>
              ) : (
                <>
                  <span className="font-bold text-secondary-gold">Fresh Edition</span> Live
                </>
              )}
              <span className="text-[10px] text-slate-400 font-mono ml-1.5 hidden sm:inline-block">
                ({updateManifest.buildHash.slice(0, 7)})
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-secondary-gold hover:bg-secondary-gold/90 text-slate-950 text-xs font-bold rounded-full sm:rounded-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title={isHindi ? 'नया संस्करण लोड करें' : 'Smoothly apply latest edition'}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>{isHindi ? 'अपडेट हो रहा...' : 'Updating...'}</span>
              </>
            ) : (
              <>
                <span>{isHindi ? 'अपडेट करें' : 'Update Now'}</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Dismiss update notification"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
