import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, ShieldCheck, UserPlus, Sparkles, Images, CalendarDays, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { AuthService } from '../../auth/services/AuthService';
import { CommandPalette } from '../components/CommandPalette';
import { toast } from 'sonner';
import { useGlobalRealtime } from '../hooks/useGlobalRealtime';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Moderación', href: '/admin/moderation', icon: ShieldCheck },
  { name: 'Invitaciones', href: '/admin/invitations', icon: UserPlus },
  { name: 'Servicios', href: '/admin/services', icon: Sparkles },
  { name: 'Galería', href: '/admin/gallery', icon: Images },
  { name: 'Reservas', href: '/admin/bookings', icon: CalendarDays },
];

export const AdminLayout = () => {
  useGlobalRealtime();

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
    <div className="min-h-screen bg-[#FAF7F7] flex flex-col md:flex-row font-sans selection:bg-[#F3E4E9] selection:text-[#301C27]">
      <CommandPalette />
      
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-5 bg-[#FAF7F7] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9">
            <img src="/logo/logo.png" alt="Karin Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 outline-none text-[#301C27] hover:bg-[#EBDDE2]/30 rounded-full transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#301C27]/5 backdrop-blur-sm z-50 md:hidden transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Inset (Estilo Arc/Apple) */}
      <aside className={clsx(
        "fixed md:sticky top-0 left-0 md:top-4 md:left-4 h-screen md:h-[calc(100vh-32px)] w-[260px] bg-white/70 backdrop-blur-xl md:rounded-[2rem] border-r md:border border-[#EBDDE2]/50 flex flex-col z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_8px_30px_rgba(0,0,0,0.02)]",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col p-8 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex-shrink-0">
                <img src="/logo/logo.png" alt="Karin Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xs font-semibold text-[#301C27] tracking-[0.2em] uppercase leading-none">Karin</h1>
                <span className="text-[9px] text-[#765E68]/80 tracking-[0.1em] mt-1">Workspace</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-[#765E68] hover:bg-[#FAF7F7] rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 text-sm group relative",
                  isActive
                    ? "text-[#301C27] font-medium"
                    : "text-[#765E68] font-light hover:text-[#301C27] hover:bg-white/50"
                )}
              >
                {isActive && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#CF7F9B] rounded-full shadow-[0_0_8px_rgba(207,127,155,0.4)]" />
                )}

                <Icon className={clsx(
                  "w-[18px] h-[18px] transition-transform duration-300", 
                  isActive ? "text-[#301C27] scale-110" : "text-[#765E68]/50 group-hover:text-[#CF7F9B] group-hover:scale-110"
                )} />
                <span className="tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-sm font-light text-[#765E68] hover:bg-[#F3E4E9]/30 hover:text-[#301C27] transition-all duration-300"
          >
            <LogOut className="w-[18px] h-[18px] text-[#765E68]/50" />
            <span className="tracking-wide">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        {/* Header Orgánico Integrado */}
        <header className="hidden md:flex items-center justify-between px-12 pt-10 pb-6 sticky top-0 bg-gradient-to-b from-[#FAF7F7] via-[#FAF7F7]/95 to-transparent z-30 pointer-events-none">
          <div className="pointer-events-auto">
            {/* Breadcrumb muy minimalista */}
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase">
              <span className="text-[#765E68]/50">Workspace</span>
              <span className="text-[#EBDDE2]">/</span>
              <span className="text-[#CF7F9B]">{currentNav?.name || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pointer-events-auto">
            {/* Search minimalista */}
            <button className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/50 hover:bg-white border border-[#EBDDE2]/50 hover:border-[#EBDDE2] shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-all duration-300 text-sm">
              <Search className="w-4 h-4 text-[#765E68]/60 group-hover:text-[#301C27] transition-colors" />
              <span className="text-[#765E68] font-light">Buscar...</span>
              <div className="flex items-center gap-0.5 ml-4 text-[10px] text-[#765E68]/40 font-medium tracking-widest">
                <span>CTRL</span><span>K</span>
              </div>
            </button>
            
            {/* Avatar premium */}
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#EBDDE2]/50 shadow-[0_2px_10px_rgba(0,0,0,0.01)] overflow-hidden p-1">
              <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-[#F3E4E9] to-[#FAF7F7] flex items-center justify-center text-[#301C27] text-sm font-display font-medium">
                K
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="flex-1 px-5 md:px-12 pb-12 pt-6 md:pt-0 max-w-[1400px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
