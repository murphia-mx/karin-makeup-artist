import { Outlet, Link, useLocation } from 'react-router-dom';

import { ChevronLeft } from 'lucide-react';
import { WORKSPACE_SECTIONS } from './WorkspaceCard';
import { clsx } from 'clsx';

/**
 * WorkspaceLayout: Layout interno del módulo Workspace.
 * Desktop: índice lateral (240px) + contenido (flex-1)
 * Móvil: El índice es la pantalla raíz /admin/workspace.
 *        Cada sección ocupa pantalla completa.
 */
export const WorkspaceLayout = () => {
  const location = useLocation();
  const isRoot = location.pathname === '/admin/workspace';

  // En móvil: si no estamos en la raíz, mostrar solo el contenido (full-screen)
  // En desktop: siempre mostrar el sidebar + contenido

  const activeSectionName = WORKSPACE_SECTIONS.find(
    s => location.pathname.startsWith(s.href)
  )?.name;

  return (
    <div className="flex gap-0 -m-4 md:-m-8 min-h-[calc(100vh-80px)]">
      
      {/* === SIDEBAR DE ÍNDICE (solo desktop) === */}
      <aside className="hidden lg:flex flex-col w-64 min-h-full bg-white border-r border-[#EFE7E4] p-4 sticky top-0">
        <div className="mb-6 px-2">
          <h2 className="text-xs font-semibold text-[#3D2C2C] uppercase tracking-widest">Workspace</h2>
          <p className="text-[10px] text-[#7A6B67] mt-0.5">Gestiona tu negocio</p>
        </div>

        <nav className="flex-1 space-y-0.5">
          {WORKSPACE_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = location.pathname.startsWith(section.href);
            return (
              <Link
                key={section.id}
                to={section.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm group',
                  isActive
                    ? 'bg-[#FDF8F8] text-[#3D2C2C] font-medium border border-[#EFE7E4]'
                    : 'text-[#7A6B67] hover:bg-[#FDFBFB] hover:text-[#3D2C2C] font-light'
                )}
              >
                <Icon className={clsx('w-4 h-4', isActive ? 'text-[#D99AA8]' : 'text-[#C2B5B0] group-hover:text-[#D99AA8]')} />
                <span>{section.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Back button en móvil cuando se está en una sección */}
        {!isRoot && (
          <div className="lg:hidden mb-6">
            <Link
              to="/admin/workspace"
              className="inline-flex items-center gap-1.5 text-sm text-[#7A6B67] hover:text-[#3D2C2C] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Workspace
            </Link>
            {activeSectionName && (
              <h1 className="text-xl font-light text-[#3D2C2C] mt-2">{activeSectionName}</h1>
            )}
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
};
