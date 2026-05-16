import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import ThemeToggle from '../components/ThemeToggle';

const Signup = () => {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setSubmitting(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden gradient-hero p-10 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,white,transparent_40%),radial-gradient(circle_at_70%_70%,white,transparent_40%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <Link to="/" className="relative inline-flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-base font-bold backdrop-blur-sm">T</span>
          <span className="text-base font-semibold">Team Tasks</span>
        </Link>

        <div className="relative space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">Get your team aligned</h2>
          <p className="max-w-md text-sm text-white/85">
            Create your workspace in seconds. Add projects, invite members, assign tasks, and track progress in one place.
          </p>
          <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3 backdrop-blur-sm">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <div className="text-xs">
              <div className="font-medium">Workspace owner</div>
              <p className="text-white/75">The first account you create is automatically the admin.</p>
            </div>
          </div>
        </div>

        <div className="relative text-xs text-white/70">© {new Date().getFullYear()} Team Tasks.</div>
      </div>

      <div className="relative flex flex-col">
        <div className="flex items-center justify-end p-6">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
              <p className="text-sm text-muted-foreground">Free, takes less than a minute.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={update('name')} placeholder="Jane Doe" required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={update('confirm')} required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (<><Loader2 className="animate-spin" /> Creating account...</>) : (<>Create account <ArrowRight /></>)}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
