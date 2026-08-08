

export const DashboardSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 w-full animate-pulse">
      {/* Business Health (Hero) Skeleton */}
      <section>
        <div className="bg-white border border-brand-border-light rounded-[2rem] p-8 md:p-12 shadow-[0_2px_20px_rgba(61,44,44,0.02)] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-brand-border-light rounded-full" />
            <div className="h-10 w-64 bg-brand-border-light rounded-full" />
            <div className="h-4 w-48 bg-brand-border-light rounded-full" />
          </div>
          <div className="h-12 w-32 bg-brand-border-light rounded-full" />
        </div>
      </section>

      {/* Quick Actions Skeleton */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-brand-border-light flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-border-light shrink-0" />
            <div className="space-y-2 w-full">
              <div className="h-3 w-3/4 bg-brand-border-light rounded-full" />
              <div className="h-2 w-1/2 bg-brand-border-light rounded-full" />
            </div>
          </div>
        ))}
      </section>

      {/* KPIs & Timeline Grid Skeleton */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[1.5rem] p-6 border border-brand-border-light">
                <div className="h-4 w-1/2 bg-brand-border-light rounded-full mb-6" />
                <div className="h-10 w-1/3 bg-brand-border-light rounded-full mb-4" />
                <div className="h-3 w-2/3 bg-brand-border-light rounded-full" />
              </div>
            ))}
          </div>
          <div className="bg-brand-surface border border-brand-border-light rounded-[1.5rem] h-64" />
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white rounded-[1.5rem] p-6 border border-brand-border-light h-[500px]">
            <div className="h-5 w-1/2 bg-brand-border-light rounded-full mb-8" />
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-brand-border-light mt-2" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-3/4 bg-brand-border-light rounded-full" />
                    <div className="h-3 w-1/2 bg-brand-border-light rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
