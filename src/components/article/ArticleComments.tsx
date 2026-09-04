import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, Shield, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getArticleComments, postComment } from '../../services/commentService';
import { CommentRecord } from '../../repositories/types';

interface ArticleCommentsProps {
  articleId: string;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({
  articleId,
  isOpen,
  onToggleOpen,
}) => {
  const { isHindi } = useLanguage();
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleId && isOpen) {
      loadComments();
    }
  }, [articleId, isOpen]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getArticleComments(articleId);
      setComments(data);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim() || !body.trim()) {
      setError(isHindi ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await postComment({
        articleId,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim(),
        body: body.trim(),
      });

      if (res.success) {
        setSubmitted(true);
        setBody('');
        setTimeout(() => setSubmitted(false), 6000);
      } else {
        setError(res.error || (isHindi ? 'टिप्पणी सबमिट करने में विफल।' : 'Failed to submit comment.'));
      }
    } catch {
      setError(isHindi ? 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।' : 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="my-10 pt-6 border-t border-border-subtle" id="comments">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="font-serif text-lg font-bold text-ink">
            {isHindi ? 'पाठक दृष्टिकोण और टिप्पणियां' : 'Reader Perspectives & Discussion'}
          </h3>
          <span className="text-xs bg-surface-container px-2 py-0.5 rounded text-ink-muted font-medium">
            {comments.length}
          </span>
        </div>
        <button
          onClick={onToggleOpen}
          className="text-xs text-primary font-bold hover:underline cursor-pointer"
        >
          {isOpen
            ? (isHindi ? 'टिप्पणियां छिपाएं' : 'Collapse')
            : (isHindi ? 'टिप्पणियां देखें / जोड़ें' : 'View / Add Comment')}
        </button>
      </div>

      {isOpen ? (
        <div className="bg-surface-lowest border border-border-subtle p-4 sm:p-6 rounded-sm space-y-6">
          {/* Moderation guideline banner */}
          <div className="p-3 bg-surface-container rounded-sm text-xs text-ink-secondary flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              {isHindi
                ? 'एनपी न्यूज़ मेट्रो सभ्य और तर्कसंगत बहस को प्रोत्साहित करता है। सभी टिप्पणियों की संपादकीय आचार संहिता के अनुसार समीक्षा की जाती है।'
                : 'NP News Metro encourages reasoned, respectful debate. All comments are moderated in accordance with our Editorial Integrity Code.'}
            </p>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  {isHindi ? 'आपका नाम' : 'Your Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={isHindi ? 'उदा. राजेश कुमार' : 'e.g. Rajesh Kumar'}
                  className="w-full px-3 py-2 bg-canvas border border-border-subtle rounded-sm text-xs text-ink focus:outline-hidden focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  {isHindi ? 'ईमेल (गोपनीय रहेगा)' : 'Email (Kept Private)'} *
                </label>
                <input
                  type="email"
                  required
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-canvas border border-border-subtle rounded-sm text-xs text-ink focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                {isHindi ? 'आपकी टिप्पणी' : 'Your Comment'} *
              </label>
              <textarea
                rows={3}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isHindi ? 'बहस में अपना दृष्टिकोण जोड़ें...' : 'Add your civil perspective to the debate...'}
                className="w-full p-3 bg-canvas border border-border-subtle rounded-sm text-xs text-ink focus:outline-hidden focus:border-primary"
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {submitted && (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {isHindi
                    ? 'आपकी टिप्पणी संपादकीय समीक्षा के लिए भेज दी गई है। स्वीकृति के बाद यह यहां प्रदर्शित होगी।'
                    : 'Your comment has been submitted for editorial moderation and will appear once approved.'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-container text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isHindi ? 'भेजा जा रहा है...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'समीक्षा हेतु प्रस्तुत करें' : 'Submit for Moderation'}</span>
                </>
              )}
            </button>
          </form>

          {/* Approved Comments List */}
          <div className="pt-4 border-t border-border-subtle space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              {isHindi ? `स्वीकृत टिप्पणियां (${comments.length})` : `Approved Comments (${comments.length})`}
            </h4>

            {loading ? (
              <div className="flex items-center justify-center py-6 text-ink-muted text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>{isHindi ? 'टिप्पणियां लोड हो रही हैं...' : 'Loading comments...'}</span>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-ink-muted italic py-2">
                {isHindi ? 'अभी कोई टिप्पणी स्वीकृत नहीं है। पहले टिप्पणीकार बनें!' : 'No approved comments yet. Be the first to share your perspective!'}
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 bg-surface-container rounded-sm border border-border-subtle/60 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-ink">{c.authorName}</span>
                      <span className="text-[10px] text-ink-muted">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-ink-secondary leading-relaxed whitespace-pre-line">{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-muted">
          {isHindi
            ? 'सभ्य और सार्थक संवाद बनाए रखने के लिए टिप्पणियों की हमारे संपादकीय सत्यनिष्ठा डेस्क द्वारा समीक्षा की जाती है।'
            : 'Comments are moderated by our editorial integrity desk to maintain constructive civil discourse.'}
        </p>
      )}
    </section>
  );
};
