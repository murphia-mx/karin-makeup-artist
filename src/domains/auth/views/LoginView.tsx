import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Lock } from 'lucide-react';
import { AuthService } from '../services/AuthService';

export const LoginView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Where to redirect after successful login
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);
    const { error } = await AuthService.signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast.error('Credenciales incorrectas o acceso denegado.');
    } else {
      toast.success('Bienvenida de nuevo, Karin.');
      navigate(from, { replace: true });
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-6">
      <div>
        <label className="block text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-2">
          Correo Electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="karin@example.com"
          autoComplete="email"
          className="w-full p-4 rounded-xl bg-brand-surface border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-all font-light text-brand-text"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-2">
          Contraseña
        </label>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full p-4 rounded-xl bg-brand-surface border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-all font-light text-brand-text"
          />
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-border" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-brand-text text-white hover:bg-brand-surface-dark-hover transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
