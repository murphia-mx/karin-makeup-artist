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
  <div className="bg-white rounded-[1.5rem] p-8 border border-[#EFE7E4] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col h-full">
    <div className="mb-8">
      <div className="w-48 h-5 bg-[#EFE7E4] animate-pulse rounded mb-2" />
      <div className="w-64 h-3 bg-[#EFE7E4] animate-pulse rounded" />
    </div>
    <div className="flex-1 flex items-end gap-2 px-4 opacity-30">
      {[40, 70, 45, 90, 60, 30].map((h, i) => (
        <div key={i} className="flex-1 bg-[#D99AA8] rounded-t-sm animate-pulse" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

const PremiumTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-[0_12px_40px_rgba(61,44,44,0.08)] border border-[#EFE7E4] min-w-[140px] transform transition-all duration-200">
        <p className="text-xs text-[#7A6B67] mb-3 font-medium uppercase tracking-wider">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <span className="text-sm font-medium text-[#3D2C2C] capitalize flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name === REVIEW_STATUS.APPROVED ? 'Aprobadas' : entry.name === REVIEW_STATUS.PENDING ? 'Por leer' : entry.name}
              </span>
              <span className="text-sm font-bold text-[#3D2C2C]">{entry.value}</span>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 h-[420px]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <>
            <motion.div key="skel-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <ChartSkeleton />
            </motion.div>
            <motion.div key="skel-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <ChartSkeleton />
            </motion.div>
          </>
        ) : !charts || (charts.approvalTrend.length === 0 && charts.starDistribution.length === 0) ? (
          <motion.div 
            key="empty" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="lg:col-span-2 h-full flex items-center justify-center bg-[#FDFBFB] rounded-[1.5rem] border border-[#EFE7E4] border-dashed shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-8 text-center"
          >
            <EmptyState
              icon={<Sparkles className="w-8 h-8 text-[#D99AA8]/40" />}
              title="Descubriendo tendencias"
              description="Cuando existan más reseñas, aquí verás gráficas hermosas para entender cómo crece tu negocio a través del tiempo."
            />
          </motion.div>
        ) : (
          <>
            {/* Tendencia Semanal (Área) */}
            <motion.div
              key="chart-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-[1.5rem] p-8 border border-[#EFE7E4] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col h-full hover:border-[#D99AA8]/30 transition-colors duration-300"
            >
              <div className="mb-8 shrink-0">
                <h3 className="text-lg font-medium text-[#3D2C2C]">El ritmo de tus opiniones</h3>
                <p className="text-sm font-light text-[#7A6B67]">¿Están aumentando tus reseñas?</p>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.approvalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D99AA8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#D99AA8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D8D2C4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#D8D2C4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="week" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#8A7969', fontWeight: 500 }} 
                      dy={10} 
                      tickFormatter={(val) => val.split('-W')[1] ? `Sem ${val.split('-W')[1]}` : val}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#8A7969', fontWeight: 500 }} 
                      dx={-10}
                    />
                    <Tooltip cursor={{ stroke: '#F2EDE4', strokeWidth: 1, strokeDasharray: '4 4' }} content={<PremiumTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey={REVIEW_STATUS.APPROVED} 
                      stroke="#D99AA8" 
                      strokeWidth={3} 
                      fill="url(#colorApproved)" 
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey={REVIEW_STATUS.PENDING} 
                      stroke="#D8D2C4" 
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
              className="bg-white rounded-[1.5rem] p-8 border border-[#EFE7E4] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col h-full hover:border-[#D99AA8]/30 transition-colors duration-300"
            >
              <div className="mb-8 shrink-0">
                <h3 className="text-lg font-medium text-[#3D2C2C]">Así te califican</h3>
                <p className="text-sm font-light text-[#7A6B67]">El nivel de satisfacción de tus clientas</p>
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
                      tick={{ fontSize: 14, fill: '#3D2C2C', fontWeight: 500 }} 
                      width={30}
                      tickFormatter={(val) => `${val}★`}
                    />
                    <Tooltip cursor={{ fill: '#FAF8F7' }} content={<PremiumTooltip />} />
                    <Bar 
                      dataKey="count" 
                      radius={[0, 4, 4, 0]} 
                      barSize={24}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {charts.starDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.stars === 5 ? '#D99AA8' : entry.stars >= 4 ? '#E8C5CE' : '#EAE6DF'} />
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
