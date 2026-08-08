import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Inbox, LineChart, Link, Settings } from 'lucide-react';
import './CommandPalette.css'; // Minimal CSS for cmdk internal classes

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/20 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-brand-border-light animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 border-b border-brand-border-light">
          <Search className="w-5 h-5 text-brand-text-muted" />
          <Command.Input 
            placeholder="¿Qué estás buscando? (Ej. moderar, analytics...)" 
            className="w-full p-4 font-light text-brand-text bg-transparent outline-none placeholder:text-brand-text-muted/60"
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="p-4 text-center text-brand-text-muted font-light">
            No se encontraron resultados.
          </Command.Empty>
          
          <Command.Group heading="Navegación" className="text-xs font-medium text-brand-text-muted px-2 py-3 uppercase tracking-wider">
            <Command.Item onSelect={() => runCommand(() => navigate('/admin/dashboard'))} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer aria-selected:bg-brand-surface aria-selected:text-brand-text text-[#5A4A4A] transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Principal</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/admin/moderation'))} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer aria-selected:bg-brand-surface aria-selected:text-brand-text text-[#5A4A4A] transition-colors">
              <Inbox className="w-4 h-4" />
              <span>Cola de Moderación</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/admin/analytics'))} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer aria-selected:bg-brand-surface aria-selected:text-brand-text text-[#5A4A4A] transition-colors">
              <LineChart className="w-4 h-4" />
              <span>Analíticas y Rendimiento</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/admin/invitations'))} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer aria-selected:bg-brand-surface aria-selected:text-brand-text text-[#5A4A4A] transition-colors">
              <Link className="w-4 h-4" />
              <span>Generar Invitaciones</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/admin/settings'))} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer aria-selected:bg-brand-surface aria-selected:text-brand-text text-[#5A4A4A] transition-colors">
              <Settings className="w-4 h-4" />
              <span>Configuración del Sistema</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};
