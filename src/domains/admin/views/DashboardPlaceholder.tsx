export const DashboardPlaceholder = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-light text-brand-text mb-2">Bienvenida de nuevo, Karin</h1>
      <p className="text-brand-text-muted font-light mb-8">Aquí tienes un resumen del rendimiento de tus reseñas.</p>
      
      {/* Placeholder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-brand-border-light shadow-sm h-32" />
        <div className="bg-white rounded-3xl p-6 border border-brand-border-light shadow-sm h-32" />
        <div className="bg-white rounded-3xl p-6 border border-brand-border-light shadow-sm h-32" />
      </div>
    </div>
  );
};
