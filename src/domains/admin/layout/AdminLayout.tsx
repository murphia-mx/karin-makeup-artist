import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Inbox, LineChart, Link as LinkIcon, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { AuthService } from '../../auth/services/AuthService';
import { CommandPalette } from '../components/CommandPalette';
import { toast } from 'sonner';
import { useGlobalRealtime } from '../hooks/useGlobalRealtime';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Moderación', href: '/admin/moderation', icon: Inbox },
  { name: 'Insights', href: '/admin/insights', icon: LineChart },
  { name: 'Invitaciones', href: '/admin/invitations', icon: LinkIcon },
  { name: 'Workspace', href: '/admin/workspace', icon: Sparkles },
];

export const AdminLayout = () => {
  useGlobalRealtime(); // <-- Global Realtime Listener

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentNav = navigation.find(item => location.pathname.startsWith(item.href));

  const handleLogout = async () => {
    await AuthService.signOut();
    toast.success('Sesión cerrada correctamente');
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col md:flex-row">
      <CommandPalette />
      
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-brand-border-light sticky top-0 z-40">
        <h1 className="text-xl font-light text-brand-text uppercase tracking-wide">Karin</h1>
        <button onClick={() => setSidebarOpen(true)} className="p-2">
          <Menu className="w-6 h-6 text-brand-text" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-brand-border-light flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-light text-brand-text uppercase tracking-wide">Karin</h1>
            <p className="text-[10px] tracking-[0.2em] text-brand-text-muted mt-1">WORKSPACE</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2">
            <X className="w-5 h-5 text-brand-text-muted" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm",
                  isActive
                    ? "bg-brand-surface text-brand-text font-medium"
                    : "text-brand-text-muted hover:bg-brand-surface/50 hover:text-[#5A4A4A] font-light"
                )}
              >
                <Icon className={clsx("w-4 h-4", isActive ? "text-brand-text" : "text-brand-border")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-border-light">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-light text-brand-text-muted hover:bg-brand-surface/50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-6 sticky top-0 bg-brand-surface/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-2 text-sm text-brand-text-muted font-light">
            <span>Admin</span>
            <span>/</span>
            <span className="text-brand-text capitalize">{currentNav?.name || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-brand-text-muted flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-brand-border">
              <span className="font-mono">Ctrl</span>+<span className="font-mono">K</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-gray-light border border-brand-border overflow-hidden">
              {/* User Avatar Placeholder */}
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
