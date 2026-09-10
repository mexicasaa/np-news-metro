import React, { useState } from 'react';
import { 
  Home, Newspaper, FileText, LayoutTemplate, Image as ImageIcon, 
  DollarSign, Search, Users, BarChart3, Settings, Plus, Bell, 
  ExternalLink, CheckCircle2, Shield, AlertTriangle, Flame, Clock,
  RefreshCw, Check, Sparkles, ChevronDown, LogOut, Menu, X, Video,
  PenTool, Globe
} from 'lucide-react';
import { UserRole, UserProfile, ROLE_PERMISSIONS } from '../../types/admin';
import { mockAdminUsers } from '../../data/mockAdminData';

export type AdminSection = 
  | 'dashboard'
  | 'publishing'
  | 'new-article'
  | 'edit-article'
  | 'editorial'
  | 'videos'
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
  reviewCount = 25,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const permissions = ROLE_PERMISSIONS[currentUser.role];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'publishing', label: 'Publishing Center', icon: FileText, badge: reviewCount || 25 },
    { id: 'editorial', label: 'Editorial', icon: Newspaper },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'homepage-layout', label: 'Homepage', icon: LayoutTemplate },
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f1f4f9] text-slate-800 antialiased font-sans relative flex p-2.5 sm:p-3.5 lg:p-4 gap-3 sm:gap-4 lg:gap-4.5 selection:bg-red-500 selection:text-white">
      {/* Ambient Pastel Mesh Gradient Glow Orbs (Pinned behind interface) */}
      <div className="pointer-events-none fixed -top-24 -right-24 w-[600px] h-[600px] bg-gradient-to-bl from-pink-200/35 via-purple-100/25 to-transparent rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed -bottom-24 -left-24 w-[650px] h-[650px] bg-gradient-to-tr from-blue-200/35 via-sky-100/25 to-transparent rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/20 via-pink-50/15 to-transparent rounded-full blur-3xl z-0" />

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden animate-fadeIn"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ======================================================================
          1. FIXED MODERN SIDEBAR (Perfect Full-Height Alignment on Desktop)
          ====================================================================== */}
      <aside 
        className={`
          fixed lg:relative inset-y-2.5 sm:inset-y-3.5 lg:inset-y-0 left-2.5 sm:left-3.5 lg:left-0 z-50 w-60 xl:w-64 h-[calc(100vh-1.25rem)] sm:h-[calc(100vh-1.75rem)] lg:h-full shrink-0 select-none transition-all duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'}
        `}
        aria-label="Admin Sidebar"
      >
        <div className="h-full bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl flex flex-col justify-between overflow-y-auto hide-scrollbar p-3.5">
          <div>
            {/* Logo & Brand Header */}
            <div className="flex items-center justify-between pb-3 pt-0.5 px-1 border-b border-slate-100/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-serif font-black text-base shadow-sm shadow-red-500/25">
                  NP
                </div>
                <div>
                  <h1 className="font-sans font-black text-[15px] text-slate-900 tracking-tight leading-tight">
                    News Metro
                  </h1>
                  <p className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                    EDITORIAL ADMIN
                  </p>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="pt-2.5 space-y-0.5" aria-label="Admin Navigation">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id || 
                  (item.id === 'publishing' && (currentSection === 'new-article' || currentSection === 'edit-article'));

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id as AdminSection)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer group ${
                      isActive
                        ? 'bg-red-50 text-red-600 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Quote Card (Matching screenshot) */}
          <div className="pt-2.5 border-t border-slate-100/80 space-y-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-white/90 to-slate-50/70 border border-white/80 shadow-xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                <PenTool className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <p className="text-[10px] text-slate-600 leading-snug font-medium">
                Good journalism builds a better tomorrow.
              </p>
            </div>

            {/* Public Site Link */}
            <button
              onClick={onExitToPublicSite}
              className="w-full py-1.5 px-2.5 text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>View Public Reader Site</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================================
          2. MAIN WORKSPACE (Aligned Search Header + Scrollable Card Content)
          ====================================================================== */}
      <div className="flex-1 h-full min-w-0 flex flex-col gap-3 lg:gap-3.5 overflow-hidden z-10">
        
        {/* Top Floating Glass Header (Matching horizontal height & alignment) */}
        <header className="h-10 shrink-0 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Menu Trigger + Global Search Bar */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden h-10 w-10 bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl text-slate-700 hover:bg-white shadow-xs flex items-center justify-center cursor-pointer shrink-0"
              title="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Global Search Bar (with Ctrl K pill matching screenshot) */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stories, tags, reporters..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-16 bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 text-slate-500 text-[10px] font-mono px-2 py-0.5 rounded-md border border-slate-200 pointer-events-none">
                Ctrl K
              </span>
            </div>
          </div>

          {/* Right: Environment Toggle, Notifications & Profile Card */}
          <div className="flex items-center gap-2.5">
            
            {/* Environment Toggle (Production / Staging) */}
            <div className="hidden sm:inline-flex items-center bg-white/80 backdrop-blur-md border border-white/80 p-1 rounded-full shadow-xs text-xs h-10">
              <button
                onClick={() => onToggleEnvironment('production')}
                className={`px-3.5 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center font-semibold text-xs leading-none ${
                  activeEnvironment === 'production'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                Production
              </button>
              <button
                onClick={() => onToggleEnvironment('staging')}
                className={`px-3.5 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center font-semibold text-xs leading-none ${
                  activeEnvironment === 'staging'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                Staging
              </button>
            </div>

            {/* Notifications Bell Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-xs flex items-center justify-center text-slate-700 hover:bg-white relative transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2.5 right-2.5"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl p-3 z-50 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                    <span>Notifications</span>
                    <span className="text-[10px] text-red-600 cursor-pointer">Mark all read</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    <div className="py-2.5 space-y-1">
                      <p className="font-semibold text-slate-900">🚨 Stories Live on Portal</p>
                      <p className="text-[11px] text-slate-500">All published stories are currently distributed across CDN nodes.</p>
                      <span className="text-[10px] text-slate-400">Just now</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Card (Matching "Priya Sharma, Editor" in screenshot) */}
            <div className="relative">
              <div
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="h-10 flex items-center gap-2.5 bg-white/80 backdrop-blur-md border border-white/80 shadow-xs px-3 rounded-2xl cursor-pointer hover:bg-white transition-all select-none"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name || 'Priya Sharma'}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize leading-tight">
                    {currentUser.role ? currentUser.role.replace('_', ' ') : 'Editor'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </div>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl p-2 z-50 text-xs animate-fadeIn space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase font-bold border-b border-slate-100">
                    Role Switcher (Testing Mode)
                  </div>
                  {mockAdminUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onChangeUserRole(user.role);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                        currentUser.role === user.role
                          ? 'bg-red-50 text-red-600 font-bold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="capitalize font-semibold">{user.role.replace('_', ' ')}</div>
                        <div className="text-[10px] text-slate-400">{user.name}</div>
                      </div>
                      {currentUser.role === user.role && <Check className="w-3.5 h-3.5 text-red-600" />}
                    </button>
                  ))}

                  {onLogout && (
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out / Lock</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Admin Body Content (Scrolls smoothly without visible slider) */}
        <main className="flex-1 min-h-0 overflow-y-auto rounded-3xl hide-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};