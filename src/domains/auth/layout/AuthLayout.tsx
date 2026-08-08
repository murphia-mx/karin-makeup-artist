import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center p-4">
      {/* Premium Minimalist Background/Overlay can go here */}
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-brand-text tracking-wide uppercase">Karin</h1>
          <p className="text-sm tracking-[0.2em] text-brand-text-muted mt-2">ADMINISTRATION</p>
        </div>
        
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-brand-border-light">
          <Outlet />
        </div>
        
        <p className="text-center text-xs text-brand-text-muted mt-8 font-light">
          Secured by Supabase Auth &bull; Private Access Only
        </p>
      </div>
    </div>
  );
};
