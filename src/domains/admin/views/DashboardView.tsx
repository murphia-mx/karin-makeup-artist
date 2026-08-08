import { BusinessHealth } from '../components/Dashboard/BusinessHealth';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { BusinessKPIs } from '../components/Dashboard/BusinessKPIs';
import { DashboardCharts } from '../components/Dashboard/DashboardCharts';
import { BusinessInsights } from '../components/Dashboard/BusinessInsights';
import { AiAdvisorWidget } from '../components/Dashboard/AiAdvisorWidget';
import { ActivityTimeline } from '../components/Dashboard/ActivityTimeline';

export const DashboardView = () => {
  return (
    <div className="w-full pb-20 font-sans">
      
      {/* 1. Encabezado Editorial (Saludo y Contexto) */}
      <section className="mb-12 md:mb-16">
        <BusinessHealth />
      </section>

      {/* 2. La IA como Insight Principal Orgánico (no widget) */}
      <section className="mb-16 md:mb-20">
        <AiAdvisorWidget />
      </section>

      {/* 3. Datos Duros: Jerarquía tipográfica, no tarjetas idénticas */}
      <section className="mb-20">
        <div className="mb-6 flex items-baseline justify-between border-b border-[#EBDDE2]/50 pb-4">
          <h2 className="text-[10px] font-semibold text-[#765E68]/60 uppercase tracking-widest">Estado del Negocio</h2>
        </div>
        <BusinessKPIs />
      </section>

      {/* 4. Columnas Naturales (Gráficos vs Acciones) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Columna Principal: Gráficos y Tendencias */}
        <div className="lg:col-span-8 flex flex-col gap-16">
          <div>
            <div className="mb-8 flex items-baseline justify-between border-b border-[#EBDDE2]/50 pb-4">
              <h2 className="text-[10px] font-semibold text-[#765E68]/60 uppercase tracking-widest">Rendimiento Histórico</h2>
            </div>
            <DashboardCharts />
          </div>
          
          <div>
            <div className="mb-8 flex items-baseline justify-between border-b border-[#EBDDE2]/50 pb-4">
              <h2 className="text-[10px] font-semibold text-[#765E68]/60 uppercase tracking-widest">Análisis Cualitativo</h2>
            </div>
            <BusinessInsights />
          </div>
        </div>

        {/* Columna Secundaria: Operaciones (Flotante, más sutil) */}
        <div className="lg:col-span-4 flex flex-col gap-12">
          <div>
            <div className="mb-6 flex items-baseline justify-between border-b border-[#EBDDE2]/50 pb-4">
              <h2 className="text-[10px] font-semibold text-[#765E68]/60 uppercase tracking-widest">Acciones Rápidas</h2>
            </div>
            <QuickActions />
          </div>

          <div>
            <div className="mb-6 flex items-baseline justify-between border-b border-[#EBDDE2]/50 pb-4">
              <h2 className="text-[10px] font-semibold text-[#765E68]/60 uppercase tracking-widest">Registro de Actividad</h2>
            </div>
            <ActivityTimeline />
          </div>
        </div>
        
      </section>
    </div>
  );
};
