import React from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight, 
  ExternalLink, Copy, Sparkles, FileText, Check, X
} from 'lucide-react';
import { ReadinessCheckResult, DuplicateMatch } from '../../types/admin';

interface PublishingReadinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  checks: ReadinessCheckResult[];
  duplicates: DuplicateMatch[];
  onProceedToPublish: () => void;
  onReviewExistingStory?: (storyId: string) => void;
  isPublishing?: boolean;
}

export const PublishingReadinessModal: React.FC<PublishingReadinessModalProps> = ({
  isOpen,
  onClose,
  checks,
  duplicates,
  onProceedToPublish,
  onReviewExistingStory,
  isPublishing = false,
}) => {
  if (!isOpen) return null;

  const requiredChecks = checks.filter((c) => c.category === 'required');
  const recommendedChecks = checks.filter((c) => c.category === 'recommended');
  const warningChecks = checks.filter((c) => c.category === 'warning');

  const allRequiredPassed = requiredChecks.every((c) => c.passed);
  const totalIssues = checks.filter((c) => !c.passed).length;
  const hasDuplicates = duplicates.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-surface-lowest border border-border-subtle rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-full ${allRequiredPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-editorial-red'}`}>
              {allRequiredPassed ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-ink">
                Publishing Readiness Validation
              </h2>
              <p className="text-xs text-ink-muted">
                Automated multi-point inspection before dispatching to WordPress and live CDN.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-ink rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Readiness Status Banner */}
        <div className={`p-4 border-b text-xs font-semibold flex items-center justify-between ${
          allRequiredPassed && totalIssues === 0
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : allRequiredPassed
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-red-50 text-editorial-red border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {allRequiredPassed && totalIssues === 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm">Ready to Publish ✓ (All Checks Passed)</span>
              </>
            ) : allRequiredPassed ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="font-bold">{totalIssues} Recommended Items Need Attention (Publish Allowed)</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-editorial-red" />
                <span className="font-bold">Required Fields Missing — Publication Blocked</span>
              </>
            )}
          </div>
          <span className="font-mono text-[11px] uppercase">
            {checks.filter((c) => c.passed).length}/{checks.length} Passed
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Duplicate Story Warning (if any found) */}
          {hasDuplicates && (
            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-sm p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Copy className="w-4 h-4 text-amber-700" />
                <span>Possible Duplicate Story Detected ({duplicates.length} Matches)</span>
              </div>
              <p className="text-ink-secondary text-xs">
                The duplicate detection engine scanned existing stories for similar headlines, keywords, and topics to prevent newsroom fragmentation.
              </p>

              <div className="space-y-2 pt-1">
                {duplicates.map((dup) => (
                  <div key={dup.id} className="bg-white p-3 rounded-xs border border-amber-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{dup.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-ink-muted mt-0.5 font-mono">
                        <span className="uppercase text-primary font-bold">{dup.category}</span>
                        <span>•</span>
                        <span>Published: {dup.publishDate}</span>
                        <span>•</span>
                        <span className="text-amber-700 font-bold">Similarity: {dup.similarityScore}%</span>
                      </div>
                    </div>

                    {onReviewExistingStory && (
                      <button
                        onClick={() => onReviewExistingStory(dup.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-bold text-ink whitespace-nowrap cursor-pointer"
                      >
                        Review Existing
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. Required Checklist */}
          <div>
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted pb-2 border-b border-border-subtle mb-3">
              1. Required for Live Publication ({requiredChecks.filter(c => c.passed).length}/{requiredChecks.length})
            </h3>
            <div className="space-y-2.5">
              {requiredChecks.map((item) => (
                <div key={item.code} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-editorial-red shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-bold ${item.passed ? 'text-ink' : 'text-editorial-red'}`}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-ink-muted">{item.description}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    item.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-editorial-red'
                  }`}>
                    {item.passed ? 'Passed' : 'Required'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Recommended Editorial Checklist */}
          <div>
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted pb-2 border-b border-border-subtle mb-3">
              2. Recommended Editorial Standards ({recommendedChecks.filter(c => c.passed).length}/{recommendedChecks.length})
            </h3>
            <div className="space-y-2.5">
              {recommendedChecks.map((item) => (
                <div key={item.code} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-ink">{item.title}</p>
                      <p className="text-[11px] text-ink-muted">{item.description}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    item.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {item.passed ? 'Passed' : 'Recommended'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Warnings */}
          {warningChecks.length > 0 && (
            <div>
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted pb-2 border-b border-border-subtle mb-3">
                3. Warning Indicators
              </h3>
              <div className="space-y-2.5">
                {warningChecks.map((item) => (
                  <div key={item.code} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-ink">{item.title}</p>
                        <p className="text-[11px] text-ink-muted">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-border-subtle flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink cursor-pointer"
          >
            Back to Editor
          </button>

          <div className="flex items-center gap-3">
            {hasDuplicates && (
              <span className="text-[11px] text-amber-700 font-semibold">
                Duplicate warning acknowledged
              </span>
            )}

            <button
              onClick={onProceedToPublish}
              disabled={!allRequiredPassed || isPublishing}
              className={`px-5 py-2.5 rounded-sm font-bold text-xs flex items-center gap-2 shadow-sm transition-all ${
                allRequiredPassed && !isPublishing
                  ? 'bg-editorial-red hover:bg-red-800 text-white cursor-pointer hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{hasDuplicates ? 'Continue & Publish Anyway' : 'Execute Safe Publish'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
