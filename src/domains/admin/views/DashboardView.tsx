import { BusinessHealth } from '../components/Dashboard/BusinessHealth';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { BusinessKPIs } from '../components/Dashboard/BusinessKPIs';
import { DashboardCharts } from '../components/Dashboard/DashboardCharts';
import { BusinessInsights } from '../components/Dashboard/BusinessInsights';
import { AiAdvisorWidget } from '../components/Dashboard/AiAdvisorWidget';
import { ActivityTimeline } from '../components/Dashboard/ActivityTimeline';

export const DashboardView = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* SECTION 1: Business Health (Hero) */}
      <section>
        <BusinessHealth />
      </section>

      {/* SECTION 2: Quick Actions */}
      <section>
        <QuickActions />
      </section>

      {/* SECTION 3: Business Intelligence Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content: KPIs, Charts, Insights) */}
        <div className="xl:col-span-2 flex flex-col">
          {/* Top Row: Core KPIs */}
          <BusinessKPIs />
          
          {/* Middle Row: Graphical Analysis */}
          <DashboardCharts />
          
          {/* Bottom Row: AI & Insights */}
          <BusinessInsights />
          <AiAdvisorWidget />
        </div>

        {/* Right Column (Activity & Timeline) */}
        <div className="xl:col-span-1 h-full">
          <ActivityTimeline />
        </div>
        
      </section>
    </div>
  );
};
