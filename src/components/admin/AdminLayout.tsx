import React, { useState } from 'react';
import { 
  LayoutDashboard, Newspaper, FileText, LayoutTemplate, Image as ImageIcon, 
  DollarSign, Search, Users, BarChart3, Settings, Plus, Bell, 
  ExternalLink, CheckCircle2, Shield, AlertTriangle, Flame, Clock,
  RefreshCw, Check, Sparkles, ChevronDown, LogOut, Menu, X
} from 'lucide-react';
import { UserRole, UserProfile, ROLE_PERMISSIONS } from '../../types/admin';
import { mockAdminUsers } from '../../data/mockAdminData';

export type AdminSection = 
  | 'dashboard'
  | 'publishing'
  | 'new-article'
  | 'edit-article'
  | 'editorial'
  | 'content'
  | 'homepage-layout'
  | 'media'
  | 'monetization'
  | 'seo'
  | 'audience'
  | 'analytics'
  | 'users'
  | 'system';

interface AdminLayoutProps {
  currentSection: AdminSection;
  onNavigateSection: (section: AdminSection, params?: any) => void;
  currentUser: UserProfile;
  onChangeUserRole: (role: UserRole) => void;
  onExitToPublicSite: () => void;
  onLogout?: () => void;
  onQuickCreate: () => void;
  children: React.ReactNode;
  activeEnvironment: 'production' | 'staging';
  onToggleEnvironment: (env: 'production' | 'staging') => void;
  breakingCount?: number;
  reviewCount?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onNavigateSection,
  currentUser,
  onChangeUserRole,
  onExitToPublicSite,
  onLogout,
  onQuickCreate,
  children,
  activeEnvironment,
  onToggleEnvironment,
  breakingCount = 2,
  reviewCount = 8,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const permissions = ROLE_PERMISSIONS[currentUser.role];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'publishing', label: 'Publishing Center', icon: Newspaper, isP0: true, badge: reviewCount > 0 ? reviewCount : undefined },
    { id: 'editorial', label: 'Editorial', icon: FileText },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'homepage-layout', label: 'Homepage', icon: LayoutTemplate },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'monetization', label: 'Monetization', icon: DollarSign },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System', icon: Settings },
  ];

  const handleNavigate = (section: AdminSection) => {
    onNavigateSection(section);
    setMobileSidebarOpen(false);
  };

  const handleQuickCreate = () => {
    onQuickCreate();
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface-lowest flex text-ink antialiased font-sans relative">
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-fadeIn"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ======================================================================
          1. LEFT ADMIN SIDEBAR (Responsive Slide-over on Mobile / Static on Desktop)
          ====================================================================== */}
      <aside 
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50 w-72 lg:w-64 bg-surface-lowest border-r border-border-subtle flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none overflow-y-auto
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Admin Sidebar"
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
            <div>
              <h1 className="font-serif font-black text-lg sm:text-xl text-editorial-red tracking-tight leading-none">
                NP News Metro
              </h1>
              <p className="text-[11px] font-sans font-semibold text-ink-muted uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Editorial Admin</span>
              </p>
            </div>

            {/* Mobile Close Drawer Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Close Menu"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Button */}
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={handleQuickCreate}
              disabled={!permissions.canCreate}
              className={`w-full py-2.5 px-3 rounded-sm font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                permissions.canCreate
                  ? 'bg-editorial-red hover:bg-red-800 text-white cursor-pointer hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={permissions.canCreate ? 'Create a new article' : 'Your role does not have article creation permission'}
            >
              <Plus className="w-4 h-4" />
              <span>New Story</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-0.5" aria-label="Admin Navigation">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id || 
                (item.id === 'publishing' && (currentSection === 'new-article' || currentSection === 'edit-article'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as AdminSection)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-semibold transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-editorial-red font-bold border-l-3 border-editorial-red'
                      : 'text-ink-secondary hover:bg-surface-container hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-editorial-red' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.isP0 && (
                      <span className="bg-amber-100 text-amber-800 font-mono text-[9px] px-1 py-0.2 rounded font-bold uppercase shrink-0">
                        P0
                      </span>
                    )}
                  </div>

                  {item.badge !== undefined && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Info & Public Site Link */}
        <div className="p-4 border-t border-border-subtle bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>WordPress REST v2</span>
            <span className="font-mono text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          </div>

          <button
            onClick={() => {
              onExitToPublicSite();
              setMobileSidebarOpen(false);
            }}
            className="w-full py-2 px-3 border border-border-subtle bg-white hover:bg-slate-100 rounded-sm text-xs font-bold text-ink flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>View Public Site</span>
          </button>

          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                setMobileSidebarOpen(false);
              }}
              className="w-full py-2 px-3 border border-red-200 bg-red-50/50 hover:bg-red-50 rounded-sm text-xs font-bold text-editorial-red flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out / Lock</span>
            </button>
          )}
        </div>
      </aside>

      {/* ======================================================================
          2. MAIN ADMIN WORKSPACE
          ====================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        {/* Top App Bar */}
        <header className="h-14 sm:h-16 bg-surface-lowest border-b border-border-subtle px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Left: Hamburger (Mobile) + Environment Switcher */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-ink-secondary hover:text-ink hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            {/* Brand Logo snippet for Mobile */}
            <div className="lg:hidden flex items-center gap-1.5">
              <span className="font-serif font-black text-sm sm:text-base text-editorial-red tracking-tight leading-none">
                NP News
              </span>
            </div>

            {/* Environment Switcher Tabs */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-sm border border-border-subtle text-[11px] sm:text-xs font-semibold">
              <button
                onClick={() => onToggleEnvironment('production')}
                className={`px-2.5 sm:px-3 py-1 rounded-xs transition-all cursor-pointer ${
                  activeEnvironment === 'production'
                    ? 'bg-white text-editorial-red font-bold shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Production
              </button>
              <button
                onClick={() => onToggleEnvironment('staging')}
                className={`px-2.5 sm:px-3 py-1 rounded-xs transition-all cursor-pointer ${
                  activeEnvironment === 'staging'
                    ? 'bg-white text-secondary-dark font-bold shadow-2xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Staging
              </button>
            </div>

            {activeEnvironment === 'staging' && (
              <span className="hidden md:inline-block bg-amber-50 text-amber-800 border border-amber-200 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-sm">
                Sandbox Mode
              </span>
            )}
          </div>

          {/* Right: Role Switcher, Notifications, User Profile, Quick Create, Sign Out */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Dynamic Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-border-subtle rounded-sm text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer"
                title="Switch active user role for permission testing"
              >
                <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="hidden md:inline text-ink-muted">Role:</span>
                <span className="font-bold text-primary capitalize truncate max-w-[70px] sm:max-w-none">
                  {currentUser.role.replace('_', ' ')}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-surface-lowest border border-border-subtle rounded-md shadow-xl p-2 z-50 animate-fadeIn">
                  <div className="px-2 py-1 text-[11px] font-mono text-ink-muted uppercase font-bold border-b border-border-subtle mb-1">
                    Select Role Permission Mode
                  </div>
                  {mockAdminUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onChangeUserRole(user.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded text-xs flex items-center justify-between cursor-pointer ${
                        currentUser.role === user.role
                          ? 'bg-red-50 text-editorial-red font-bold'
                          : 'hover:bg-slate-100 text-ink'
                      }`}
                    >
                      <div>
                        <div className="capitalize font-semibold">{user.role.replace('_', ' ')}</div>
                        <div className="text-[10px] text-ink-muted">{user.name} ({user.department})</div>
                      </div>
                      {currentUser.role === user.role && <Check className="w-3.5 h-3.5 text-editorial-red shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-ink-secondary relative transition-colors cursor-pointer"
                title="System & Editorial Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-editorial-red rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-1 w-72 sm:w-80 bg-surface-lowest border border-border-subtle rounded-md shadow-xl p-3 z-50 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-border-subtle font-bold">
                    <span>Editorial Notifications</span>
                    <span className="text-[10px] text-editorial-red cursor-pointer">Mark all read</span>
                  </div>
                  <div className="divide-y divide-border-subtle max-h-64 overflow-y-auto">
                    <div className="py-2.5 space-y-1">
                      <p className="font-semibold text-ink">🚨 Breaking Story Approved</p>
                      <p className="text-[11px] text-ink-muted">Parliament Monsoon Session report is ready for live publishing.</p>
                      <span className="text-[10px] text-slate-400">3 mins ago</span>
                    </div>
                    <div className="py-2.5 space-y-1">
                      <p className="font-semibold text-ink">📝 Review Requested</p>
                      <p className="text-[11px] text-ink-muted">David Chen submitted "Tech Sector Q3 Earnings" for copy review.</p>
                      <span className="text-[10px] text-slate-400">18 mins ago</span>
                    </div>
                    <div className="py-2.5 space-y-1">
                      <p className="font-semibold text-ink">⚡ CDN Purge Complete</p>
                      <p className="text-[11px] text-ink-muted">Edge cache refreshed for /politics and /home.</p>
                      <span className="text-[10px] text-slate-400">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-border-subtle">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-border-subtle shrink-0"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-ink leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-ink-muted leading-tight capitalize">{currentUser.role.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Quick Create Header Button */}
            <button
              onClick={onQuickCreate}
              disabled={!permissions.canCreate}
              className={`py-1.5 px-2.5 sm:px-3.5 rounded-sm font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all ${
                permissions.canCreate
                  ? 'bg-editorial-red hover:bg-red-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="Create New Story"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">New Story</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 hover:bg-red-50 hover:text-editorial-red text-slate-500 rounded-sm transition-colors cursor-pointer"
                title="Sign Out of Admin"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Admin Body Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};