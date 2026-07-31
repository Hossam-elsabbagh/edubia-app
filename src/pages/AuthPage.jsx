import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles, UserPlus } from 'lucide-react';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.fullName.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage({ tone: 'success', text: 'Account created. Check your email to confirm it, then sign in.' });
          setMode('signin');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setMessage({ tone: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-orb orb-one" />
      <div className="auth-orb orb-two" />
      <motion.section
        className="auth-showcase"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src="/edubia-logo.png" alt="Edubia" className="auth-logo" />
        <span className="eyebrow"><Sparkles size={15} /> Instructor workspace</span>
        <h1>Teach. Track. Follow up.</h1>
        <p>One animated workspace for schedules, students, daily attendance, and monthly reports.</p>
        <div className="feature-list">
          <div><CheckCircle2 /> Every instructor has a private account</div>
          <div><CheckCircle2 /> Daily attended / absent follow-up</div>
          <div><CheckCircle2 /> Monthly Excel report with Paid, Cover, and Free totals</div>
        </div>
      </motion.section>

      <motion.section
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.55 }}
      >
        <div className="auth-card-heading">
          <span className="auth-icon">{mode === 'signup' ? <UserPlus /> : <LockKeyhole />}</span>
          <div>
            <p className="eyebrow">Edubia</p>
            <h2>{mode === 'signup' ? 'Create instructor account' : 'Welcome back'}</h2>
            <p>{mode === 'signup' ? 'Create your own private teaching workspace.' : 'Sign in to continue to your schedule.'}</p>
          </div>
        </div>

        {!hasSupabaseConfig && (
          <div className="inline-message error">Add the Supabase URL and anon key to <code>public/config.js</code> or <code>.env.local</code>.</div>
        )}

        <form className="form-stack" onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              <span>Full name</span>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Instructor name" required />
            </label>
          )}
          <label>
            <span>Email address</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" required />
          </label>
          {message && <div className={`inline-message ${message.tone}`}>{message.text}</div>}
          <button className="button primary auth-submit" type="submit" disabled={busy || !hasSupabaseConfig}>
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            {!busy && <ArrowRight size={18} />}
          </button>
        </form>

        <button className="auth-switch" type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(null); }}>
          {mode === 'signup' ? 'Already have an account? Sign in' : 'New instructor? Create an account'}
        </button>
      </motion.section>
    </main>
  );
}
