import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight, 
  ExternalLink, RefreshCw, Sparkles, Check, X, Globe, Eye,
  Share2, BarChart2, Layers, Search, Radio, Wifi
} from 'lucide-react';
import { PublishingOperation, PublishingStepStatus, PostPublishVerification } from '../../types/admin';

interface PublishOrchestratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: PublishingOperation | null;
  onViewLiveStory: (articleId: string) => void;
  onViewHomepage: () => void;
  onRetryStep?: (stepNumber: number) => void;
  onFinish: () => void;
}

export const PublishOrchestratorModal: React.FC<PublishOrchestratorModalProps> = ({
  isOpen,
  onClose,
  operation,
  onViewLiveStory,
  onViewHomepage,
  onRetryStep,
  onFinish,
}) => {
  if (!isOpen || !operation) return null;

  const isCompleted = operation.status === 'published_healthy' || operation.status === 'published_warnings';
  const hasFailedCritical = operation.status === 'failed';
  const isRunning = operation.status === 'in_progress';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-surface-lowest border border-border-subtle rounded-md shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isCompleted 
                ? 'bg-emerald-100 text-emerald-700' 
                : hasFailedCritical 
                ? 'bg-red-100 text-editorial-red' 
                : 'bg-blue-100 text-primary'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : hasFailedCritical ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <RefreshCw className="w-5 h-5 animate-spin" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-ink">
                  {isCompleted ? 'Published Successfully ✓' : hasFailedCritical ? 'Publishing Blocked' : '15-Step Publishing Pipeline'}
                </h2>
                <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                  {operation.operationId}
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5 truncate max-w-lg">
                Article: "{operation.articleTitle}"
              </p>
            </div>
          </div>

          {!isRunning && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-ink rounded-sm transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Status Header Banner */}
        <div className={`p-3.5 px-6 border-b text-xs font-semibold flex items-center justify-between ${
          operation.status === 'published_healthy'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : operation.status === 'published_warnings'
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : operation.status === 'failed'
            ? 'bg-red-50 text-editorial-red border-red-200'
            : 'bg-blue-50 text-blue-900 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {isRunning ? (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Executing Safe Publish Workflow...</span>
              </>
            ) : operation.status === 'published_healthy' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Website Live & All 15 Downstream Systems Synchronized</span>
              </>
            ) : operation.status === 'published_warnings' ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="font-bold">Website Published Live ✓ (1 Non-Critical Task Queued for Retry)</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-editorial-red" />
                <span className="font-bold">Critical Step Failed — Article Not Published</span>
              </>
            )}
          </div>

          <div className="text-[11px] font-mono">
            Started: {operation.startedAt.split(' ')[1] || 'Just now'}
          </div>
        </div>

        {/* Scrollable Pipeline Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Post-Publish Single Truth Health Panel (When Completed) */}
          {isCompleted && operation.verificationReport && (
            <div className="bg-white border-2 border-emerald-200 rounded-md p-5 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span className="font-serif font-bold text-sm text-ink">Publish Health Verification Panel</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  HTTP 200 OK
                </span>
              </div>

              {/* Grid of distribution confirmations */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                <div className="bg-slate-50 p-2.5 rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-ink">Website Core</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Live
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-ink">Homepage Feed</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Updated
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-ink">Category Feed</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Updated
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-ink">Internal Search</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Indexed
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-ink">News Sitemap</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Pinged
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-ink">Edge CDN Cache</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Refreshed
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-ink">Analytics Event</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Deduplicated
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-ink">Structured Schema</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> NewsArticle
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-sm border border-border-subtle flex items-center justify-between">
                  <span className="text-ink">Social Syndication</span>
                  {operation.verificationReport.distribution.social === 'failed' ? (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Retryable
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Dispatched
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 15 Sequential Pipeline Steps Table */}
          <div>
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted pb-2 border-b border-border-subtle mb-3 flex items-center justify-between">
              <span>Execution Pipeline (15 Steps)</span>
              <span className="text-ink-secondary">Idempotent Safe Publish</span>
            </h3>

            <div className="space-y-2">
              {operation.steps.map((step) => {
                const isStepRunning = step.status === 'running';
                const isStepSuccess = step.status === 'success';
                const isStepFailed = step.status === 'failed';
                const isStepWarning = step.status === 'warning';

                return (
                  <div
                    key={step.stepNumber}
                    className={`p-3 rounded-sm border flex items-center justify-between gap-3 transition-colors ${
                      isStepRunning
                        ? 'bg-blue-50/80 border-blue-300'
                        : isStepFailed
                        ? 'bg-red-50/80 border-red-300'
                        : isStepSuccess
                        ? 'bg-slate-50/60 border-border-subtle'
                        : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[11px] font-bold text-slate-400 w-5">
                        {step.stepNumber.toString().padStart(2, '0')}
                      </span>

                      <div className="shrink-0">
                        {isStepRunning ? (
                          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : isStepSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isStepFailed ? (
                          <XCircle className="w-4 h-4 text-editorial-red" />
                        ) : isStepWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className={`font-semibold ${isStepFailed ? 'text-editorial-red font-bold' : 'text-ink'}`}>
                          {step.name}
                        </p>
                        {step.message && (
                          <p className="text-[11px] text-ink-muted mt-0.5 font-mono">
                            {step.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {step.durationMs !== undefined && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {step.durationMs}ms
                        </span>
                      )}

                      {isStepFailed && step.retryable && onRetryStep && (
                        <button
                          onClick={() => onRetryStep(step.stepNumber)}
                          className="px-2 py-0.5 bg-editorial-red hover:bg-red-800 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Retry Step
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-border-subtle flex items-center justify-between">
          <button
            onClick={onFinish}
            className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink cursor-pointer"
          >
            {isCompleted ? 'Close & Return to Center' : 'Dismiss'}
          </button>

          <div className="flex items-center gap-3">
            {isCompleted && (
              <>
                <button
                  onClick={onViewHomepage}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-border-subtle rounded-sm text-xs font-bold text-ink transition-colors cursor-pointer"
                >
                  Verify Homepage
                </button>

                <button
                  onClick={() => onViewLiveStory(operation.articleId)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-sm text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Live Public Story</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
