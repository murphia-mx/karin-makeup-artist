import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, ShieldCheck, UserPlus, Sparkles, Images, CalendarDays, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { AuthService } from '../../auth/services/AuthService';
import { CommandPalette } from '../components/CommandPalette';
import { toast } from 'sonner';
import { useGlobalRealtime } from '../hooks/useGlobalRealtime';

const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Gestión',
    items: [
      { name: 'Reservas', href: '/admin/reservas', icon: CalendarDays },
      { name: 'Servicios', href: '/admin/services', icon: Sparkles },
      { name: 'Galería', href: '/admin/gallery', icon: Images },
    ]
  },
  {
    label: 'Clientes',
    items: [
      { name: 'Moderación', href: '/admin/moderation', icon: ShieldCheck },
      { name: 'Invitaciones', href: '/admin/invitations', icon: UserPlus },
    ]
  }
];

export const AdminLayout = () => {
  useGlobalRealtime();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Bloquear scroll en móvil cuando el sidebar está abierto
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await AuthService.signOut();
    toast.success('Sesión cerrada correctamente');
    navigate('/auth/login');
  };

  const currentNav = navigationGroups.flatMap(g => g.items).find(item => location.pathname.startsWith(item.href));

  return (
    <div className="min-h-[100dvh] bg-admin-bg flex flex-col md:flex-row font-admin-sans text-admin-text selection:bg-admin-accent-soft selection:text-admin-text pb-[env(safe-area-inset-bottom)]">
      <CommandPalette />
      
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-admin-surface/90 backdrop-blur-xl sticky top-0 z-40 border-b border-admin-border shadow-sm pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-admin-bg border border-admin-border flex items-center justify-center overflow-hidden shrink-0">
             <img src="/logo/logo.png" alt="Karin Logo" className="w-5 h-5 object-contain" />
          </div>
          <h1 className="text-[18px] font-bold tracking-tight truncate">Karin Workspace</h1>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors active:scale-95 shrink-0">
          <Menu className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-admin-text/40 backdrop-blur-sm z-[60] md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Sidebar */}
      <aside className={clsx(
        "fixed md:sticky top-0 left-0 h-[100dvh] w-[280px] md:w-[260px] bg-admin-surface border-r border-admin-border flex flex-col z-[70] md:z-50 transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0 overflow-hidden",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-7 pb-6 pt-[max(2rem,env(safe-area-inset-top))] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-admin-surface border border-admin-border shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo/logo.png" alt="Karin Logo" className="w-6 h-6 object-contain opacity-90" />
            </div>
            <div className="flex flex-col ml-1 min-w-0">
              <span className="font-bold text-[16px] tracking-tight text-admin-text leading-none truncate">Karin Makeup</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-admin-text-muted mt-0.5 truncate">Workspace</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 -mr-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors active:scale-95 shrink-0">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto scrollbar-hide">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <h3 className="px-3 mb-2 text-[11px] font-bold text-admin-text-muted/60 uppercase tracking-widest">{group.label}</h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[14px] group relative overflow-hidden",
                        isActive
                          ? "bg-admin-surface-2 text-admin-text font-bold"
                          : "text-admin-text-muted font-medium hover:text-admin-text hover:bg-admin-surface-2/50"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-admin-accent-dark rounded-r-full" />
                      )}
                      <Icon className={clsx(
                        "w-[18px] h-[18px] transition-colors duration-200", 
                        isActive ? "text-admin-accent-dark" : "text-admin-text-muted/60 group-hover:text-admin-accent-soft"
                      )} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="tracking-wide ml-1">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-admin-border/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[14px] font-medium text-admin-text-muted hover:bg-admin-surface-2 hover:text-admin-error transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px] text-admin-text-muted/60" strokeWidth={2} />
            <span className="tracking-wide ml-1">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden bg-admin-bg">
        {/* Header */}
        <header className="hidden md:flex items-center justify-between px-10 py-6 sticky top-0 bg-admin-bg/80 backdrop-blur-xl z-30 border-b border-admin-border/40">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] font-bold tracking-wide">
            <span className="text-admin-text-muted/60">WORKSPACE</span>
            <span className="text-admin-text-muted/40">/</span>
            <span className="text-admin-text uppercase">{currentNav?.name || 'DASHBOARD'}</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Search Premium */}
            <button className="group flex items-center gap-3 px-4 py-2 rounded-lg bg-admin-surface border border-admin-border shadow-sm hover:border-admin-accent/30 transition-all duration-200 text-[13px] w-[240px]">
              <Search className="w-4 h-4 text-admin-text-muted/50 group-hover:text-admin-accent transition-colors" strokeWidth={2} />
              <span className="text-admin-text-muted font-medium flex-1 text-left">Buscar...</span>
              <div className="flex items-center gap-1 text-[10px] text-admin-text-muted font-bold bg-admin-bg border border-admin-border px-1.5 py-0.5 rounded">
                <span>⌘K</span>
              </div>
            </button>
            
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-admin-accent-light border border-admin-accent-soft flex items-center justify-center text-admin-accent font-bold text-[14px]">
              K
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="flex-1 px-5 md:px-10 py-8 max-w-[1400px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
