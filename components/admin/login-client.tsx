'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Wine, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  // If already authenticated, go to admin
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/admin');
    }
  }, [status, session, router]);

  const handleSubmit = async (e: any) => {
    e?.preventDefault?.();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: '/admin',
      });
      if (res?.ok) {
        // Force full page navigation to /admin to ensure middleware picks up the new session cookie
        window.location.href = '/admin';
      } else {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      }
    } catch {
      setError('Error al iniciar sesión. Intenta nuevamente.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-2xl p-8 border border-border/30" style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="text-center mb-8">
          <Wine className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="font-display text-2xl font-bold gold-text">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground mt-1">Ingresa tus credenciales</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input type="email" value={email} onChange={(e: any) => setEmail(e?.target?.value ?? '')} required
              className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              placeholder="admin@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Contraseña</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={(e: any) => setPassword(e?.target?.value ?? '')} required
                className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Ingresando...' : <><LogIn className="w-4 h-4" /> Ingresar</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
