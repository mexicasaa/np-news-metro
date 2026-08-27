import React, { useState, useEffect } from 'react';
import { Vote, CheckCircle2, BarChart2, ShieldCheck, Share2, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MetromatPollProps {
  onNavigateMetromat?: () => void;
  className?: string;
}

export const MetromatPoll: React.FC<MetromatPollProps> = ({
  onNavigateMetromat,
  className = '',
}) => {
  const { isHindi } = useLanguage();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(14820);
  const [copied, setCopied] = useState(false);

  // Poll configuration
  const pollData = {
    id: 'poll-urban-density-2026',
    date: isHindi ? '27 अगस्त 2026' : 'August 27, 2026',
    title: isHindi ? 'आज का मैट्रो मत' : "Today's Metromat Poll",
    badge: isHindi ? 'दैनिक जनमत' : 'Daily Public Pulse',
    question: isHindi
      ? 'क्या भारतीय महानगरों में अनियंत्रित ऊंची इमारतों और जल-बुनियादी ढांचे के संकट को रोकने के लिए नया राष्ट्रीय कानून जरूरी है?'
      : 'Should a comprehensive national statute be enacted to regulate urban high-density sprawl and prevent civic infrastructure collapse in Indian megacities?',
    options: [
      { id: 1, textHi: 'हाँ, तुरंत सख्त कानून बने', textEn: 'Yes, strict statute is urgent', basePercent: 65, votes: 9633 },
      { id: 2, textHi: 'नहीं, मौजूदा नियम पर्याप्त हैं', textEn: 'No, existing civic norms suffice', basePercent: 27, votes: 4001 },
      { id: 3, textHi: 'कह नहीं सकते / निष्पक्ष', textEn: 'Undecided / Neutral', basePercent: 8, votes: 1186 },
    ],
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`np_${pollData.id}`);
      if (saved !== null) {
        setSelectedOption(parseInt(saved, 10));
        setHasVoted(true);
      }
    } catch (e) {}
  }, []);

  const handleVote = (optionId: number) => {
    try {
      localStorage.setItem(`np_${pollData.id}`, optionId.toString());
    } catch (e) {}
    setSelectedOption(optionId);
    if (!hasVoted) {
      setTotalVotes(prev => prev + 1);
    }
    setHasVoted(true);
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/metromat` : 'https://www.npnewsmetro.com/metromat';
    const text = isHindi
      ? `मैट्रो मत जनमत सर्वेक्षण: "${pollData.question}" - अपनी राय दर्ज करें:`
      : `Metromat Public Poll: "${pollData.question}" - Cast your vote:`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <section className={`bg-gradient-to-br from-surface-lowest via-white to-amber-50/30 border-2 border-primary/25 rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden ${className}`}>
      {/* Editorial Decorative Watermark Accent */}
      <div className="absolute -right-8 -bottom-8 font-serif font-black text-7xl text-primary/5 select-none pointer-events-none uppercase tracking-widest">
        {isHindi ? 'मत' : 'Poll'}
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-editorial-red/10 text-editorial-red flex items-center justify-center font-bold">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-ink leading-tight">
                {pollData.title}
              </h3>
              <span className="bg-editorial-red text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                {pollData.badge}
              </span>
            </div>
            <p className="text-[11px] text-ink-muted flex items-center gap-1.5 mt-0.5">
              <span>{pollData.date}</span>
              <span>•</span>
              <span className="font-mono text-[10px]">RNI: DEL HIN/2010/31544</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="p-1.5 rounded text-ink-muted hover:text-primary hover:bg-surface-container transition-colors text-xs flex items-center gap-1 cursor-pointer"
          title="Share poll"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium hidden sm:inline">
            {copied ? (isHindi ? 'लिंक कॉपी!' : 'Copied!') : (isHindi ? 'साझा करें' : 'Share')}
          </span>
        </button>
      </div>

      {/* Question */}
      <h4 className="font-serif text-sm sm:text-base font-semibold text-ink leading-snug mb-4">
        {pollData.question}
      </h4>

      {/* Voting Options & Live Results */}
      <div className="space-y-2.5 mb-4">
        {pollData.options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const currentVotes = opt.votes + (isSelected && !hasVoted ? 1 : 0);
          const percent = Math.round((currentVotes / totalVotes) * 100);

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-xs font-semibold'
                  : 'border-border-subtle bg-white hover:border-primary/40 hover:bg-surface-container/50'
              }`}
            >
              {/* Animated Progress Bar when voted */}
              {hasVoted && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out opacity-20 ${
                    opt.id === 1 ? 'bg-emerald-600' : opt.id === 2 ? 'bg-editorial-red' : 'bg-slate-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-ink">
                    {isHindi ? opt.textHi : opt.textEn}
                  </span>
                </div>

                {hasVoted && (
                  <span className="font-mono text-xs font-bold text-ink flex-shrink-0 ml-2">
                    {percent}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info & Total Votes */}
      <div className="flex items-center justify-between text-[11px] text-ink-muted pt-2 border-t border-border-subtle">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-primary" />
          <span>
            {isHindi ? 'कुल दर्ज मत:' : 'Total Votes:'}{' '}
            <strong className="font-mono text-ink">{totalVotes.toLocaleString('en-IN')}</strong>
          </span>
        </div>

        {hasVoted ? (
          <span className="text-emerald-700 font-medium flex items-center gap-1 text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isHindi ? 'आपका मत दर्ज हुआ' : 'Vote recorded'}</span>
          </span>
        ) : (
          <span className="text-editorial-red font-medium text-[10px]">
            {isHindi ? 'मतदान हेतु विकल्प चुनें' : 'Click an option to vote'}
          </span>
        )}
      </div>

      {/* Link to view all editorial columns */}
      {onNavigateMetromat && (
        <div className="mt-3 pt-2 text-center">
          <button
            onClick={onNavigateMetromat}
            className="text-[11px] font-bold text-primary hover:text-editorial-red transition-colors inline-flex items-center gap-1"
          >
            <span>{isHindi ? 'मैट्रो मत के सभी संपादकीय लेख देखें →' : 'View all Metromat Editorial Columns →'}</span>
          </button>
        </div>
      )}
    </section>
  );
};
