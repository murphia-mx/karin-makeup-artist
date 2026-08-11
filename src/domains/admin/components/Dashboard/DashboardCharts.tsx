import { motion, AnimatePresence } from 'framer-motion';
import { useAnalyticsCharts } from '../../hooks/useAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area 
} from 'recharts';
import { EmptyState } from '../../../../components/ui/States/EmptyState';
import { REVIEW_STATUS } from '../../../../domains/reviews/types/Review';
import { Sparkles } from 'lucide-react';

const ChartSkeleton = () => (
  <div className="bg-admin-surface rounded-[2rem] p-8 border border-admin-neutral/40 shadow-[0_4px_24px_rgba(45,32,37,0.02)] flex flex-col h-full">
    <div className="mb-8">
      <div className="w-48 h-5 bg-admin-surface-2 animate-pulse rounded mb-2" />
      <div className="w-64 h-3 bg-admin-surface-2 animate-pulse rounded" />
    </div>
    <div className="flex-1 flex items-end gap-2 px-4 opacity-30">
      {[40, 70, 45, 90, 60, 30].map((h, i) => (
        <div key={i} className="flex-1 bg-admin-accent-dark rounded-t-sm animate-pulse" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

const PremiumTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-admin-surface/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-admin-neutral/40 min-w-[160px] transform transition-all duration-200">
        <p className="text-[10px] text-admin-text-muted mb-4 font-bold uppercase tracking-[0.2em]">{label}</p>
        <div className="space-y-3">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-6">
              <span className="text-[13px] font-medium text-admin-text capitalize flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name === REVIEW_STATUS.APPROVED ? 'Aprobadas' : entry.name === REVIEW_STATUS.PENDING ? 'Por leer' : entry.name}
              </span>
              <span className="text-[13px] font-bold text-admin-text">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardCharts = () => {
  const { data: charts, isLoading } = useAnalyticsCharts();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 lg:h-[420px]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <>
            <motion.div key="skel-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[320px] lg:h-full">
              <ChartSkeleton />
            </motion.div>
            <motion.div key="skel-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[320px] lg:h-full">
              <ChartSkeleton />
            </motion.div>
          </>
        ) : !charts || (charts.approvalTrend.length === 0 && charts.starDistribution.length === 0) ? (
          <motion.div 
            key="empty" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="lg:col-span-2 h-[320px] lg:h-full flex items-center justify-center bg-admin-surface-2/30 rounded-[2rem] border border-admin-neutral/40 border-dashed shadow-sm p-8 text-center"
          >
            <EmptyState
              icon={<Sparkles className="w-8 h-8 text-admin-accent-dark/40" />}
              title="Descubriendo tendencias"
              description="Cuando existan más reseñas, aquí verás gráficas hermosas para entender cómo crece tu negocio a través del tiempo."
            />
          </motion.div>
        ) : (
          <>
            {/* Tendencia Semanal (Área) */}
            <motion.div
              key="chart-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-admin-surface rounded-[2rem] p-8 md:p-10 border border-admin-neutral/40 shadow-[0_4px_30px_rgba(45,32,37,0.02)] flex flex-col h-[320px] lg:h-full hover:border-admin-neutral transition-colors duration-300"
            >
              <div className="mb-8 shrink-0">
                <h3 className="text-xl font-bold text-admin-text tracking-tight mb-1">El ritmo de tus opiniones</h3>
                <p className="text-[13px] font-light text-admin-text-muted">¿Están aumentando tus reseñas?</p>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.approvalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B94F73" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#B94F73" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E9DDE1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#E9DDE1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="week" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#796B71', fontWeight: 400, fontFamily: 'Manrope' }} 
                      dy={10} 
                      tickFormatter={(val) => val.split('-W')[1] ? `Sem ${val.split('-W')[1]}` : val}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#796B71', fontWeight: 400, fontFamily: 'Manrope' }} 
                      dx={-10}
                    />
                    <Tooltip cursor={{ stroke: '#E9DDE1', strokeWidth: 1, strokeDasharray: '4 4' }} content={<PremiumTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey={REVIEW_STATUS.APPROVED} 
                      stroke="#B94F73" 
                      strokeWidth={3} 
                      fill="url(#colorApproved)" 
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey={REVIEW_STATUS.PENDING} 
                      stroke="#E9DDE1" 
                      strokeWidth={3} 
                      fill="url(#colorPending)" 
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Distribución de Estrellas (Barras Horizontales) */}
            <motion.div
              key="chart-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="bg-admin-surface rounded-[2rem] p-8 md:p-10 border border-admin-neutral/40 shadow-[0_4px_30px_rgba(45,32,37,0.02)] flex flex-col h-[320px] lg:h-full hover:border-admin-neutral transition-colors duration-300"
            >
              <div className="mb-8 shrink-0">
                <h3 className="text-xl font-bold text-admin-text tracking-tight mb-1">Así te califican</h3>
                <p className="text-[13px] font-light text-admin-text-muted">El nivel de satisfacción de tus clientas</p>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.starDistribution} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="stars" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 13, fill: '#2D2025', fontWeight: 500, fontFamily: 'Manrope' }} 
                      width={30}
                      tickFormatter={(val) => `${val}★`}
                    />
                    <Tooltip cursor={{ fill: '#F8EFF1' }} content={<PremiumTooltip />} />
                    <Bar 
                      dataKey="count" 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {charts.starDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.stars === 5 ? '#D66F91' : entry.stars >= 4 ? '#F3C5D2' : '#E9DDE1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
