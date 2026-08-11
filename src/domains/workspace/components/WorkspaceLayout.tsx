import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { WORKSPACE_SECTIONS } from './WorkspaceCard';
import { clsx } from 'clsx';

export const WorkspaceLayout = () => {
  const location = useLocation();
  const isRoot = location.pathname === '/admin/workspace';

  const activeSectionName = WORKSPACE_SECTIONS.find(
    s => location.pathname.startsWith(s.href)
  )?.name;

  return (
    <div className="flex gap-0 -m-5 md:-m-10 min-h-[calc(100vh-80px)]">
      
      {/* === SIDEBAR DE ÍNDICE (solo desktop) === */}
      <aside className="hidden lg:flex flex-col w-72 min-h-full bg-admin-surface/30 border-r border-admin-border/50 p-6 sticky top-0">
        <div className="mb-8 px-3">
          <h2 className="text-[10px] font-bold text-admin-text uppercase tracking-[0.25em]">Configuración</h2>
          <p className="text-[12px] text-admin-text-muted mt-1.5 tracking-wide">Ajustes del Workspace</p>
        </div>

        <nav className="flex-1 space-y-1">
          {WORKSPACE_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = location.pathname.startsWith(section.href);
            return (
              <Link
                key={section.id}
                to={section.href}
                className={clsx(
                  'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-[14px] group relative',
                  isActive
                    ? 'bg-admin-accent-light/40 text-admin-text font-medium'
                    : 'text-admin-text-muted hover:bg-admin-surface-2/40 hover:text-admin-text font-light'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-admin-accent rounded-r-full" />
                )}
                <Icon className={clsx('w-4 h-4 transition-transform duration-300', isActive ? 'text-admin-accent' : 'text-admin-text-muted/50 group-hover:text-admin-text-muted')} strokeWidth={isActive ? 2 : 1.5} />
                <span className="tracking-wide">{section.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="flex-1 p-6 md:p-12 overflow-auto relative">
        {/* Back button en móvil */}
        {!isRoot && (
          <div className="lg:hidden mb-8">
            <Link
              to="/admin/workspace"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-admin-text-muted hover:text-admin-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              Workspace
            </Link>
            {activeSectionName && (
              <h1 className="text-3xl font-bold tracking-tight text-admin-text mt-4">{activeSectionName}</h1>
            )}
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
};
