import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultPathForRole } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, role, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setLoading(false);
    } else {
      // Redirect immediately to the base path for this role
      // navigation will occur in effect when role becomes available
      setLoading(false);
    }
  };

  // Redirect when authenticated role is known
  useEffect(() => {
    if (user && role) {
      navigate(getDefaultPathForRole(role), { replace: true });
    }
  }, [user, role, navigate]);

  // Prevent going forward to a protected page after returning to login
  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.pushState(null, '', '/');
    }
    const onPopState = () => {
      if (window.location.pathname === '/') {
        window.history.pushState(null, '', '/');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wathiq-primary/10 via-background to-wathiq-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-wathiq-primary/20">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src="/wathiq-logo.png" 
              alt="Wathiq Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-wathiq-primary">
              واثق
            </CardTitle>
            <CardTitle className="text-2xl font-semibold mt-2">
              Wathiq
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            تسجيل الدخول إلى نظام إدارة الأعمال
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertDescription className="text-right">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@wathiq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="text-left"
                autoComplete="email"
                dir="ltr"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="text-left pr-10"
                  autoComplete="current-password"
                  dir="ltr"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-wathiq-primary hover:bg-wathiq-primary/90 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>نظام إدارة الأعمال الشامل</p>
            <p className="mt-1">Comprehensive Business Management System</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
