import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseAny as supabase } from '../../../lib/supabase';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
  Trash2,
  CreditCard,
  X,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export function ReservationsView() {
  const queryClient = useQueryClient();
  const [selectedRes, setSelectedRes] = useState<any | null>(null);

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          service:services ( name )
        `)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });
        
      if (error) throw error;
      return data || [];
    }
  });

  const updateStatus = async (id: string, field: 'status' | 'deposit_status', value: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Reserva actualizada');
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      
      if (selectedRes && selectedRes.id === id) {
        setSelectedRes({ ...selectedRes, [field]: value });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar reserva');
    }
  };

  const deleteReservation = async (id: string) => {
    if (!window.confirm('¿Estás segura de eliminar esta reserva permanentemente?')) return;
    
    try {
      const { error } = await supabase.from('reservations').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Reserva eliminada');
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      if (selectedRes?.id === id) setSelectedRes(null);
    } catch (err: any) {
      toast.error('Error al eliminar');
    }
  };

  const viewSignedImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('reservations-assets')
        .createSignedUrl(path, 60 * 10);
        
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      toast.error('Error al obtener la imagen');
    }
  };

  const pendingCount = reservations.filter((r: any) => r.status === 'pending').length;
  const confirmedCount = reservations.filter((r: any) => r.status === 'confirmed').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = reservations.filter((r: any) => r.reservation_date === todayStr).length;

  return (
    <div className="max-w-[1200px] font-admin-sans pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-admin-text tracking-tight">Reservas</h1>
        <p className="text-[14px] font-light text-admin-text-muted mt-1.5">
          Gestiona las solicitudes de reserva de tus clientas
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-admin-surface rounded-2xl border border-admin-neutral/40 p-6 shadow-[0_4px_20px_rgba(45,32,37,0.03)]">
          <p className="text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">Pendientes</p>
          <p className="text-[40px] font-bold text-admin-accent-dark tracking-tight leading-none mt-4">{pendingCount}</p>
        </div>
        <div className="bg-admin-surface rounded-2xl border border-admin-neutral/40 p-6 shadow-[0_4px_20px_rgba(45,32,37,0.03)]">
          <p className="text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">Confirmadas</p>
          <p className="text-[40px] font-bold text-admin-text tracking-tight leading-none mt-4">{confirmedCount}</p>
        </div>
        <div className="bg-admin-surface rounded-2xl border border-admin-neutral/40 p-6 shadow-[0_4px_20px_rgba(45,32,37,0.03)]">
          <p className="text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">Para Hoy</p>
          <p className="text-[40px] font-bold text-admin-text tracking-tight leading-none mt-4">{todayCount}</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-admin-surface rounded-2xl border border-admin-neutral/40 shadow-[0_4px_20px_rgba(45,32,37,0.03)] overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-[14px] text-admin-text-muted animate-pulse">Cargando reservas...</div>
        ) : reservations.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarIcon className="w-10 h-10 mx-auto mb-4 opacity-50 text-admin-text-muted" strokeWidth={1.5} />
            <p className="text-[16px] font-medium text-admin-text mb-1">No hay reservas todavía</p>
            <p className="text-[14px] font-light text-admin-text-muted">Las nuevas reservas aparecerán aquí.</p>
          </div>
        ) : (
          <div className="divide-y divide-admin-neutral/30">
            {reservations.map((res: any) => {
              const resDate = parseISO(res.reservation_date);
              const isToday = isSameDay(resDate, new Date());
              
              return (
                <div 
                  key={res.id} 
                  onClick={() => setSelectedRes(res)}
                  className="group p-5 sm:p-6 hover:bg-admin-surface-2 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-5 sm:gap-8 flex-1 min-w-0">
                    {/* Fecha Centralizada e Importante */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-2xl bg-admin-surface border border-admin-neutral/50 shadow-sm group-hover:border-admin-neutral transition-colors">
                      <span className="text-[11px] font-bold text-admin-accent-dark uppercase tracking-widest mb-1">
                        {format(resDate, 'MMM', { locale: es })}
                      </span>
                      <span className="text-[32px] font-bold text-admin-text leading-none tracking-tighter">
                        {format(resDate, 'dd')}
                      </span>
                      {isToday && (
                        <span className="mt-1 text-[9px] font-bold text-admin-success bg-admin-success/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Hoy</span>
                      )}
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-[18px] font-medium text-admin-text tracking-wide truncate">{res.client_name}</h4>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          res.status === 'confirmed' ? 'bg-admin-success/10 text-admin-success border border-admin-success/20' :
                          res.status === 'pending' ? 'bg-admin-warning/10 text-admin-warning border border-admin-warning/20' :
                          res.status === 'completed' ? 'bg-admin-text/5 text-admin-text border border-admin-text/10' :
                          'bg-admin-surface-3 text-admin-text-muted border border-admin-border'
                        }`}>
                          {res.status === 'confirmed' ? 'Confirmada' : res.status === 'pending' ? 'Pendiente' : res.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </span>
                      </div>
                      <p className="text-[14px] text-admin-text-muted font-light mb-2">{res.service?.name}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-[13px] text-admin-text-muted">
                        <span className="flex items-center gap-1.5 bg-admin-surface px-2.5 py-1 rounded-lg border border-admin-border">
                          <Clock className="w-3.5 h-3.5" strokeWidth={1.5}/> 
                          <span className="font-medium text-admin-text">{res.reservation_time ? `${res.reservation_time} hrs` : 'Por confirmar'}</span>
                        </span>
                        {res.requires_home_service && (
                          <span className="flex items-center gap-1.5 text-admin-accent-dark">
                            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5}/> A domicilio
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Anticipo & Acción */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 border-admin-border/50 pt-4 sm:pt-0 mt-2 sm:mt-0">
                    <div className="flex flex-col sm:items-end">
                      <span className="text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-1">Anticipo</span>
                      {res.deposit_status === 'paid' ? (
                        <span className="text-[13px] font-medium text-admin-success flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                        </span>
                      ) : (
                        <span className="text-[13px] font-medium text-admin-warning flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pendiente
                        </span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-admin-surface border border-admin-border group-hover:border-admin-neutral transition-colors text-admin-text-muted group-hover:text-admin-text">
                      <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail SlideOver */}
      <AnimatePresence>
        {selectedRes && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRes(null)}
              className="fixed inset-0 bg-admin-bg/40 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 w-full md:w-[450px] h-[100dvh] bg-admin-surface shadow-2xl z-[70] border-l border-admin-neutral/50 overflow-y-auto flex flex-col font-admin-sans"
            >
              <div className="pt-[max(1.5rem,env(safe-area-inset-top))] px-7 pb-4 border-b border-admin-neutral/40 flex items-center justify-between bg-admin-surface sticky top-0 z-10 shrink-0">
                <h2 className="text-2xl font-bold text-admin-text tracking-tight">Detalle de Reserva</h2>
                <button onClick={() => setSelectedRes(null)} className="p-2 -mr-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors active:scale-95">
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-7 space-y-8 flex-1 pb-[max(2rem,env(safe-area-inset-bottom))] overflow-y-auto">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${
                    selectedRes.status === 'confirmed' ? 'bg-admin-success/10 text-admin-success border border-admin-success/20' :
                    selectedRes.status === 'pending' ? 'bg-admin-warning/10 text-admin-warning border border-admin-warning/20' :
                    selectedRes.status === 'completed' ? 'bg-admin-text/5 text-admin-text border border-admin-text/10' :
                    'bg-admin-surface-3 text-admin-text-muted border border-admin-border'
                  }`}>
                    {selectedRes.status.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${
                    selectedRes.deposit_status === 'paid' ? 'bg-admin-success/10 text-admin-success border border-admin-success/20' : 'bg-admin-warning/10 text-admin-warning border border-admin-warning/20'
                  }`}>
                    Anticipo: {selectedRes.deposit_status.toUpperCase()}
                  </span>
                </div>

                {/* Cliente Info */}
                <section>
                  <h3 className="text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Cliente</h3>
                  <div className="space-y-4 bg-admin-surface-2 p-5 rounded-2xl border border-admin-neutral/40">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-admin-text-muted shrink-0" strokeWidth={1.5} />
                      <span className="text-[15px] font-medium text-admin-text break-words flex-1 min-w-0">{selectedRes.client_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-admin-text-muted" strokeWidth={1.5} />
                      <span className="text-[14px] text-admin-text-muted font-light">{selectedRes.client_phone}</span>
                    </div>
                    {selectedRes.client_email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-admin-text-muted shrink-0" strokeWidth={1.5} />
                        <span className="text-[14px] text-admin-text-muted font-light break-all flex-1 min-w-0">{selectedRes.client_email}</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Evento Info */}
                <section>
                  <h3 className="text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Servicio</h3>
                  <div className="space-y-4 bg-admin-surface-2 p-5 rounded-2xl border border-admin-neutral/40">
                    <div className="font-medium text-[15px] text-admin-text">{selectedRes.service?.name}</div>
                    
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-4 h-4 text-admin-text-muted" strokeWidth={1.5} />
                      <span className="text-[14px] text-admin-text font-medium">
                        {format(parseISO(selectedRes.reservation_date), 'EEEE d MMMM, yyyy', { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-admin-text-muted" strokeWidth={1.5} />
                      <span className="text-[14px] text-admin-text font-medium">{selectedRes.reservation_time ? `${selectedRes.reservation_time} hrs` : 'Por confirmar'}</span>
                    </div>
                    
                    {selectedRes.requires_home_service && (
                      <div className="mt-4 pt-4 border-t border-admin-neutral/40">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-admin-accent-dark mt-0.5" strokeWidth={1.5} />
                          <div>
                            <span className="text-[12px] font-bold text-admin-text uppercase tracking-widest block">A domicilio</span>
                            <span className="text-[14px] text-admin-text-muted font-light mt-1 block">{selectedRes.address}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Notas e Imagen */}
                <section>
                  <h3 className="text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Adicionales</h3>
                  <div className="space-y-3">
                    {selectedRes.notes && (
                      <div className="bg-admin-accent-soft/20 p-5 rounded-2xl border border-admin-accent-soft/30">
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-admin-accent-dark mt-0.5 shrink-0" strokeWidth={1.5} />
                          <p className="text-[14px] text-admin-text font-light leading-relaxed">{selectedRes.notes}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedRes.storage_path && (
                      <button 
                        onClick={() => viewSignedImage(selectedRes.storage_path)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-admin-surface border border-admin-neutral/40 hover:border-admin-neutral rounded-[1.25rem] text-[14px] font-medium text-admin-text transition-colors shadow-sm"
                      >
                        <ImageIcon className="w-4 h-4 text-admin-accent-dark" strokeWidth={1.5} />
                        Ver Imagen de Referencia
                      </button>
                    )}
                  </div>
                </section>

                {/* Acciones */}
                <section className="pt-6 border-t border-admin-neutral/40 space-y-3">
                  <h3 className="text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-4">Acciones</h3>
                  
                  {selectedRes.status === 'pending' && (
                    <button onClick={() => updateStatus(selectedRes.id, 'status', 'confirmed')} className="w-full flex items-center gap-3 py-4 px-5 bg-admin-text text-admin-bg hover:bg-admin-accent-dark rounded-[1.25rem] text-[14px] font-medium transition-colors shadow-[0_4px_16px_rgba(45,32,37,0.15)]">
                      <CheckCircle2 className="w-4 h-4" /> Confirmar Reserva
                    </button>
                  )}

                  {selectedRes.deposit_status === 'pending' && (
                    <button onClick={() => updateStatus(selectedRes.id, 'deposit_status', 'paid')} className="w-full flex items-center gap-3 py-4 px-5 bg-admin-surface-2 border border-admin-neutral/50 text-admin-text hover:border-admin-accent hover:bg-admin-accent/5 rounded-[1.25rem] text-[14px] font-medium transition-colors">
                      <CreditCard className="w-4 h-4" /> Marcar Anticipo Recibido
                    </button>
                  )}

                  {(selectedRes.status === 'pending' || selectedRes.status === 'confirmed') && (
                    <button onClick={() => updateStatus(selectedRes.id, 'status', 'completed')} className="w-full flex items-center gap-3 py-4 px-5 bg-admin-surface-2 border border-admin-neutral/50 text-admin-text hover:border-admin-neutral rounded-[1.25rem] text-[14px] font-medium transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Marcar como Completada
                    </button>
                  )}

                  {selectedRes.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(selectedRes.id, 'status', 'cancelled')} className="w-full flex items-center gap-3 py-4 px-5 bg-transparent border border-admin-error/20 text-admin-error hover:bg-admin-error/5 hover:border-admin-error/30 rounded-[1.25rem] text-[14px] font-medium transition-colors">
                      <XCircle className="w-4 h-4" /> Cancelar Reserva
                    </button>
                  )}

                  <button onClick={() => deleteReservation(selectedRes.id)} className="w-full flex items-center gap-3 py-4 px-5 bg-transparent text-admin-error hover:underline rounded-[1.25rem] text-[14px] font-medium transition-colors mt-6 justify-center">
                    <Trash2 className="w-4 h-4" /> Eliminar Permanentemente
                  </button>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
