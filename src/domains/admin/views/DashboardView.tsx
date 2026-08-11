import { BusinessHealth } from '../components/Dashboard/BusinessHealth';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { BusinessKPIs } from '../components/Dashboard/BusinessKPIs';
import { DashboardCharts } from '../components/Dashboard/DashboardCharts';
import { BusinessInsights } from '../components/Dashboard/BusinessInsights';
import { AiAdvisorWidget } from '../components/Dashboard/AiAdvisorWidget';
import { ActivityTimeline } from '../components/Dashboard/ActivityTimeline';
import { Sparkles, Activity, BarChart2, MessageSquare, BrainCircuit } from 'lucide-react';

export const DashboardView = () => {
  return (
    <div className="w-full pb-20 font-admin-sans">
      
      {/* HEADER: Saludo y Contexto */}
      <section className="mb-10">
        <BusinessHealth />
      </section>

      {/* KPI STRIP */}
      <section className="mb-12">
        <BusinessKPIs />
      </section>

      {/* GRID CENTRAL: Acciones rápidas / Operaciones & Actividad */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-admin-border/50">
            <Sparkles className="w-4 h-4 text-admin-accent-light" strokeWidth={2} />
            <h2 className="text-[12px] font-bold text-admin-text uppercase tracking-[0.15em]">Próximos Pasos</h2>
          </div>
          <QuickActions />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-admin-border/50">
            <Activity className="w-4 h-4 text-admin-accent-light" strokeWidth={2} />
            <h2 className="text-[12px] font-bold text-admin-text uppercase tracking-[0.15em]">Actividad Reciente</h2>
          </div>
          <ActivityTimeline />
        </div>
      </section>

      {/* GRÁFICOS Y ANÁLISIS CUALITATIVO */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-admin-border/50">
            <BarChart2 className="w-4 h-4 text-admin-accent-light" strokeWidth={2} />
            <h2 className="text-[12px] font-bold text-admin-text uppercase tracking-[0.15em]">Rendimiento Histórico</h2>
          </div>
          <DashboardCharts />
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-admin-border/50">
            <MessageSquare className="w-4 h-4 text-admin-accent-light" strokeWidth={2} />
            <h2 className="text-[12px] font-bold text-admin-text uppercase tracking-[0.15em]">Resumen de Reseñas</h2>
          </div>
          <BusinessInsights />
        </div>
      </section>

      {/* IA (Módulo Secundario) */}
      <section className="mt-16">
        <div className="flex items-center gap-2 pb-3 border-b border-admin-border/50 mb-6">
          <BrainCircuit className="w-4 h-4 text-admin-accent-light" strokeWidth={2} />
          <h2 className="text-[12px] font-bold text-admin-text uppercase tracking-[0.15em]">Insight Automático (IA)</h2>
        </div>
        <AiAdvisorWidget />
      </section>

    </div>
  );
};
