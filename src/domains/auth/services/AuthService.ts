import { supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/observability/logger';
import type { Session, User } from '@supabase/supabase-js';

// ============================================================================
// Strategy Pattern Interface
// ============================================================================
export interface IAuthProvider {
  signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }>;
  signOut(): Promise<{ error: Error | null }>;
  getSession(): Promise<Session | null>;
  onAuthStateChange(callback: (event: string, session: Session | null) => void): { unsubscribe: () => void };
}

// ============================================================================
// Supabase Authentication Provider (Production)
// ============================================================================
class SupabaseAuthProvider implements IAuthProvider {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, session: data.session, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
    return subscription;
  }
}

// ============================================================================
// Local Development Authentication Provider (Fallback)
// ============================================================================
class LocalDevAuthProvider implements IAuthProvider {
  private currentSession: Session | null = null;
  private listeners: ((event: string, session: Session | null) => void)[] = [];

  constructor() {
    const stored = localStorage.getItem('karin_dev_session');
    if (stored) {
      try {
        this.currentSession = JSON.parse(stored);
      } catch (e) {
        this.currentSession = null;
      }
    }
  }

  private notifyListeners(event: string) {
    this.listeners.forEach(listener => listener(event, this.currentSession));
  }

  async signIn(email: string, password: string) {
    // Hardcoded development credentials
    if (email === 'admin@karin.local' && password === 'admin123') {
      const user = { id: 'dev-user-id', email, role: 'admin' } as User;
      const session = { access_token: 'dev-token', user } as Session;
      
      this.currentSession = session;
      localStorage.setItem('karin_dev_session', JSON.stringify(session));
      this.notifyListeners('SIGNED_IN');
      
      return { user, session, error: null };
    }
    return { user: null, session: null, error: new Error('Invalid credentials') };
  }

  async signOut() {
    this.currentSession = null;
    localStorage.removeItem('karin_dev_session');
    this.notifyListeners('SIGNED_OUT');
    return { error: null };
  }

  async getSession() {
    return this.currentSession;
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    this.listeners.push(callback);
    return {
      unsubscribe: () => {
        this.listeners = this.listeners.filter(l => l !== callback);
      }
    };
  }
}

// ============================================================================
// Facade & Strategy Resolver
// ============================================================================
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const isPlaceholder = VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

const provider: IAuthProvider = isPlaceholder ? new LocalDevAuthProvider() : new SupabaseAuthProvider();

/**
 * AuthService handles all interaction with Authentication.
 * Automatically delegates to LocalDevAuthProvider if Supabase is not configured yet.
 */
export class AuthService {
  static async signIn(email: string, password: string) {
    const logContext = { domain: 'AUTH' as const, action: 'signIn' };
    logger.info(`Attempting sign in (Provider: ${isPlaceholder ? 'LocalDev' : 'Supabase'})`, logContext);
    
    const result = await provider.signIn(email, password);
    
    if (result.error) {
      logger.error('Sign in failed', { ...logContext, metadata: { error: result.error } });
    } else {
      logger.info('Sign in successful', logContext);
    }
    
    return result;
  }

  static async signOut() {
    const logContext = { domain: 'AUTH' as const, action: 'signOut' };
    logger.info('Signing out', logContext);
    
    const result = await provider.signOut();
    if (result.error) {
      logger.error('Sign out failed', { ...logContext, metadata: { error: result.error } });
    }
    return result;
  }

  static async getSession() {
    return provider.getSession();
  }

  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return provider.onAuthStateChange(callback);
  }
  
  static get isDevMode() {
    return isPlaceholder;
  }
}
