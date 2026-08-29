import React, { useState } from 'react';
import { 
  Edit, MoreVertical, ChevronLeft, ChevronRight, Check, 
  Trash2, Send, Eye, Shield, Filter, Search
} from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { mockAuthors } from '../../data/mockWpData';
import { getStoredPosts } from '../../utils/newsStorage';

interface EditorialListViewProps {
  posts?: WpPost[];
  onEditArticle: (post: WpPost) => void;
  onViewLiveArticle: (post: WpPost) => void;
  onDeleteArticle?: (post: WpPost) => void;
}

export const EditorialListView: React.FC<EditorialListViewProps> = ({
  posts: externalPosts,
  onEditArticle,
  onViewLiveArticle,
  onDeleteArticle,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const allPosts = externalPosts && externalPosts.length > 0 ? externalPosts : getStoredPosts();

  const editorialArticles = allPosts.map((post, idx) => {
    const authorName = post.customAuthor?.name || mockAuthors[post.authorId]?.name || 'Staff Reporter';
    const statusType: string = post.editorialStatus || (post as any).status || (idx === 2 ? 'scheduled' : idx === 3 ? 'draft' : idx === 4 ? 'review' : 'published');
    const status = statusType === 'draft' ? 'Draft' :
                   statusType === 'review' ? 'Needs Review' :
                   statusType === 'approved' ? 'Approved' :
                   statusType === 'scheduled' ? 'Scheduled' : 'Published';

    return {
      id: post.id,
      title: post.title,
      section: post.category.charAt(0).toUpperCase() + post.category.slice(1),
      author: authorName,
      status: status,
      statusType: statusType,
      date: new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      words: `${post.readTime || '3 min read'}`,
      rawPost: post
    };
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === editorialArticles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(editorialArticles.map(a => a.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header Row */}
      <div>
        <h1 className="font-serif text-3xl font-extrabold text-ink tracking-tight">
          Editorial List
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Manage and track all articles across sections.
        </p>
      </div>

      {/* Filter Toolbar (Matching Screenshot 2) */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-end gap-2 text-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-border-subtle rounded-sm bg-white font-medium focus:outline-hidden focus:border-editorial-red cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="review">Needs Review</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border border-border-subtle rounded-sm bg-white font-medium focus:outline-hidden focus:border-editorial-red cursor-pointer"
        >
          <option value="all">All Categories</option>
          <option value="politics">Politics</option>
          <option value="economy">Economy</option>
          <option value="culture">Culture</option>
          <option value="metro">Metro</option>
        </select>

        <select
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="p-2 border border-border-subtle rounded-sm bg-white font-medium focus:outline-hidden focus:border-editorial-red cursor-pointer"
        >
          <option value="all">All Authors</option>
          <option value="sarah">Sarah Jenkins</option>
          <option value="david">David Chen</option>
          <option value="elena">Elena Rostova</option>
        </select>

        <select
          className="p-2 border border-border-subtle rounded-sm bg-white font-medium focus:outline-hidden focus:border-editorial-red cursor-pointer"
        >
          <option>Bulk Actions</option>
          <option>Approve Selected</option>
          <option>Publish Selected</option>
          <option>Move to Trash</option>
        </select>
      </div>

      {/* ======================================================================
          EDITORIAL TABLE (Exact layout & styling from Screenshot 2)
          ====================================================================== */}
      <div className="bg-surface-lowest border border-border-subtle rounded-xs shadow-subtle overflow-hidden">
                {/* Mobile Cards View (<md) */}
        <div className="md:hidden divide-y divide-border-subtle">
          {editorialArticles.map((article) => {
            const isSelected = selectedIds.includes(article.id);
            return (
              <div 
                key={article.id} 
                className={"p-3.5 space-y-2.5 transition-colors " + (isSelected ? "bg-red-50/30" : "bg-surface-lowest")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(article.id)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-editorial-red cursor-pointer shrink-0"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <p 
                        onClick={() => onEditArticle(article.rawPost)}
                        className="font-serif font-bold text-sm text-ink hover:text-editorial-red transition-colors cursor-pointer leading-snug"
                      >
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-ink-muted flex-wrap">
                        <span className="font-semibold text-slate-700">{article.section}</span>
                        <span>•</span>
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{article.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {article.statusType === 'published' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-editorial-red border border-red-200 rounded-sm text-[10px] font-mono font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-editorial-red"></span>
                        <span>Published</span>
                      </span>
                    )}
                    {article.statusType === 'review' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-sm text-[10px] font-mono font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>Review</span>
                      </span>
                    )}
                    {article.statusType === 'scheduled' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-sm text-[10px] font-mono font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Scheduled</span>
                      </span>
                    )}
                    {article.statusType === 'draft' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded-sm text-[10px] font-mono font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span>Draft</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onEditArticle(article.rawPost)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onViewLiveArticle(article.rawPost)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-border-subtle text-slate-700 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View</span>
                  </button>

                  {onDeleteArticle && (
                    <button
                      onClick={() => {
                        if (window.confirm("Move \"" + article.title.slice(0, 40) + "...\" to Trash / Recovery?")) {
                          onDeleteArticle(article.rawPost);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-editorial-red rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop / Tablet Table View (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-border-subtle font-mono text-[11px] font-bold text-ink-muted uppercase">
                <th className="p-3.5 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === editorialArticles.length}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-editorial-red cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Headline</th>
                <th className="p-3.5">Section</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 font-mono">Date</th>
                <th className="p-3.5 pr-4 text-right font-mono">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {editorialArticles.map((article) => {
                const isSelected = selectedIds.includes(article.id);

                return (
                  <tr 
                    key={article.id} 
                    className={`transition-colors ${isSelected ? 'bg-red-50/30' : 'hover:bg-slate-50/80'}`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 pl-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(article.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-editorial-red cursor-pointer"
                      />
                    </td>

                    {/* Headline + ID + words */}
                    <td className="p-3.5 max-w-md">
                      <p 
                        onClick={() => onEditArticle(article.rawPost)}
                        className="font-serif font-bold text-sm text-ink hover:text-editorial-red transition-colors cursor-pointer leading-snug"
                      >
                        {article.title}
                      </p>
                      <p className="font-mono text-[10px] text-ink-muted mt-1">
                        ID: {article.id} • {article.words}
                      </p>
                    </td>

                    {/* Section */}
                    <td className="p-3.5 text-ink-secondary font-medium">
                      {article.section}
                    </td>

                    {/* Author */}
                    <td className="p-3.5 text-ink font-semibold">
                      {article.author}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      {article.statusType === 'published' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-editorial-red border border-red-200 rounded-sm text-[11px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-editorial-red"></span>
                          <span>Published</span>
                        </span>
                      )}

                      {article.statusType === 'review' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-sm text-[11px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>Needs Review</span>
                        </span>
                      )}

                      {article.statusType === 'scheduled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-sm text-[11px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          <span>Scheduled</span>
                        </span>
                      )}

                      {article.statusType === 'draft' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-sm text-[11px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-3.5 font-mono text-[11px] text-ink-muted whitespace-nowrap">
                      {article.date}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditArticle(article.rawPost)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-ink transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onViewLiveArticle(article.rawPost)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-ink transition-colors cursor-pointer"
                          title="View Live"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteArticle && (
                          <button
                            onClick={() => {
                              if (window.confirm("Move \"" + article.title.slice(0, 40) + "...\" to Trash / Recovery?")) {
                                onDeleteArticle(article.rawPost);
                              }
                            }}
                            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-editorial-red transition-colors cursor-pointer"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination (Matching Screenshot 2) */}
        <div className="p-4 bg-slate-50/70 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="font-mono text-ink-muted text-[11px]">
            Showing 1-5 of 142 articles
          </div>

          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 px-2 border border-border-subtle rounded-sm bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="px-3 py-1 bg-editorial-red text-white font-bold rounded-sm shadow-2xs cursor-pointer">
              1
            </button>
            <button className="px-3 py-1 bg-white hover:bg-slate-100 border border-border-subtle rounded-sm text-ink cursor-pointer">
              2
            </button>
            <button className="px-3 py-1 bg-white hover:bg-slate-100 border border-border-subtle rounded-sm text-ink cursor-pointer">
              3
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1 px-2 border border-border-subtle rounded-sm bg-white hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
