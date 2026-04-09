import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import { BarChart3, Shield, FileText, Zap } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'magic';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) setError(error.message);
      else setMessage('Magic link sent! Check your email.');
    } else if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Account created! Check your email to confirm, then log in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push('/dashboard');
    }

    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>SaaS Auditor — Cut Your SaaS Costs</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
        {/* Nav */}
        <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg text-gray-900">SaaS Auditor</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-12 max-w-6xl mx-auto w-full">
          {/* Hero */}
          <div className="flex-1 max-w-lg">
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Zap className="h-3 w-3" /> Free MVP
            </span>
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              Uncover hidden SaaS<br />
              <span className="text-blue-600">waste in minutes</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8">
              Upload your expense CSV, get an instant breakdown of every SaaS subscription — sorted by category, cost, and ROI risk.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <FileText className="h-5 w-5 text-blue-600" />, title: 'CSV Upload', desc: 'Drag & drop any expense export' },
                { icon: <BarChart3 className="h-5 w-5 text-blue-600" />, title: 'Auto-categorize', desc: '150+ SaaS vendors detected' },
                { icon: <Shield className="h-5 w-5 text-blue-600" />, title: 'Secure & Private', desc: 'Data never leaves your account' },
                { icon: <Zap className="h-5 w-5 text-blue-600" />, title: 'PDF Export', desc: 'Board-ready reports instantly' },
              ].map((f) => (
                <div key={f.title} className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="mt-0.5">{f.icon}</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                    <p className="text-gray-400 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Card */}
          <div className="w-full max-w-sm">
            <div className="card p-8">
              <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg">
                {(['login', 'register', 'magic'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); setMessage(''); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      mode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {m === 'login' ? 'Sign In' : m === 'register' ? 'Register' : 'Magic Link'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                </div>

                {mode !== 'magic' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    />
                  </div>
                )}

                {error && (
                  <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                )}
                {message && (
                  <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</p>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Magic Link'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
